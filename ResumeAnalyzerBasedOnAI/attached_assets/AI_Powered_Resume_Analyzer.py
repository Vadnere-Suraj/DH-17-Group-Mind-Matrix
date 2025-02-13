import warnings
import google.generativeai as genai
from PyPDF2 import PdfReader
from langchain.text_splitter import RecursiveCharacterTextSplitter
import sys
import os
import json
import time
from typing import Optional

# Suppress warnings
warnings.filterwarnings('ignore')

# Get the Gemini API key from environment variables
gemini_api_key = "GEMINI_API_KEY"
if not gemini_api_key:
    print("Error: GEMINI_API_KEY environment variable not set", file=sys.stderr)
    sys.exit(1)

genai.configure(api_key=gemini_api_key)

def load_resume(file_path: str) -> str:
    """Load and extract text from the resume PDF"""
    try:
        pdf_reader = PdfReader(file_path)
        text = ""
        for page in pdf_reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text
        return text
    except Exception as e:
        print(f"Error reading PDF: {str(e)}", file=sys.stderr)
        sys.exit(1)

def retry_with_backoff(func, max_retries: int = 3) -> Optional[str]:
    """Retry a function with exponential backoff"""
    for attempt in range(max_retries):
        try:
            return func()
        except Exception as e:
            if "429" in str(e):
                if attempt == max_retries - 1:
                    print(f"Error: API rate limit exceeded after {max_retries} attempts", 
                          file=sys.stderr)
                    sys.exit(1)
                wait_time = (2 ** attempt) + 1  # Exponential backoff
                time.sleep(wait_time)
            else:
                print(f"Error in API processing: {str(e)}", file=sys.stderr)
                sys.exit(1)
    return None

def gemini_analysis(query: str) -> str:
    """Performs analysis using Google's Gemini API with retry logic."""
    model = genai.GenerativeModel('gemini-pro')

    def analyze():
        response = model.generate_content(query)
        return response.text

    result = retry_with_backoff(analyze)
    if result is None:
        print("Failed to get response from API after retries", file=sys.stderr)
        sys.exit(1)
    return result

def resume_summary(text: str) -> str:
    """Generates a detailed summary of the resume."""
    prompt = f'''
    Analyze the following resume and provide a detailed professional summary. 
    Focus on key qualifications, experience, and overall profile:

    {text}

    Format your response in a clear, professional manner focusing only on the factual content.
    Limit the response to 3-4 paragraphs.
    '''
    return gemini_analysis(prompt)

def resume_strength(text: str) -> str:
    """Analyzes strengths in the resume."""
    prompt = f'''
    Analyze the following resume and list the key strengths and notable achievements.
    Format your response as bullet points:

    {text}

    Focus on:
    - Technical skills and expertise
    - Professional achievements
    - Notable qualifications
    - Unique value propositions

    List exactly 5-7 key strengths.
    '''
    return gemini_analysis(prompt)

def resume_weakness(text: str) -> str:
    """Analyzes weaknesses in the resume and suggests improvements."""
    prompt = f'''
    Review the following resume and provide constructive feedback for improvements.
    Format your response in two sections - Areas for Improvement and Specific Recommendations:

    {text}

    Consider:
    - Content gaps
    - Format and presentation
    - Missing key information
    - Industry best practices

    Provide 3-4 specific, actionable recommendations.
    '''
    return gemini_analysis(prompt)

def job_title_suggestion(text: str) -> str:
    """Suggests job roles based on the resume."""
    prompt = f'''
    Based on the skills, experience, and qualifications in this resume, suggest suitable job roles.
    Provide specific job titles and brief explanations for why they match:

    {text}

    Format as bullet points with:
    - Job title
    - Brief explanation of fit
    - Industry sector

    Suggest 3-4 most relevant positions.
    '''
    return gemini_analysis(prompt)

def main():
    if len(sys.argv) != 2:
        print("Error: Please provide the path to the resume file", file=sys.stderr)
        sys.exit(1)

    resume_path = sys.argv[1]
    if not os.path.exists(resume_path):
        print(f"Error: File not found: {resume_path}", file=sys.stderr)
        sys.exit(1)

    try:
        # Load and process the resume
        text = load_resume(resume_path)

        # Perform analyses with rate limit handling
        results = {
            "summary": resume_summary(text),
            "strengths": resume_strength(text),
            "weaknesses": resume_weakness(text),
            "jobSuggestions": job_title_suggestion(text)
        }

        # Output JSON results
        print(json.dumps(results, ensure_ascii=False), flush=True)

    except Exception as e:
        print(f"Error during analysis: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()