#!/usr/bin/env python
# coding: utf-8

# In[112]:


import warnings
import google.generativeai as genai
from PyPDF2 import PdfReader
from langchain.text_splitter import RecursiveCharacterTextSplitter
import getpass

# Suppress warnings
warnings.filterwarnings('ignore')


# In[113]:


# Load and extract text from the resume PDF
pdf_path = "resume.pdf"  # Update path if needed
pdf_reader = PdfReader(pdf_path)


# In[114]:


# Extract text from each page
text = ""
for page in pdf_reader.pages:
    page_text = page.extract_text()
    if page_text:
        text += page_text


# In[115]:


# Split long text into smaller chunks
text_splitter = RecursiveCharacterTextSplitter(chunk_size=700, chunk_overlap=200, length_function=len)
chunks = text_splitter.split_text(text=text)


# "linkedin.com/in/gopiashokan \ngithub.com/gopiashokan \nWORK EXPERIENCE \nSenior Process Executive - Operations \nMahendra Next Wealth IT India Pvt Ltd \n05/2019 - 12/2022\n, \n \nNamakkal"
# 
# The above text is common(overlap) for both chunks[0] and chunks[1].
# (chunk_overlap=200 - maximum length, it means length is not exceed 200)

# In[117]:


# Get Gemini API key securely
gemini_api_key = getpass.getpass('AIzaSyDwjmEEDdx-4JsOaDSvTqH9YLx13C_FoZE')
genai.configure(api_key=gemini_api_key)


# In[118]:


def gemini_analysis(chunks, query):
    """Performs analysis using Google's Gemini API."""
    try:
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(query)
        return response.text
    except Exception as e:
        return f"Error in processing: {str(e)}"


# In[119]:


def resume_summary(query_with_chunks):
    """Generates a detailed summary of the resume."""
    return f'''
    Provide a detailed summarization of the following resume and conclude with key points:
    {query_with_chunks}
    '''


# In[120]:


def resume_strength(query_with_chunks):
    """Analyzes strengths in the resume."""
    return f'''
    Analyze and explain the strengths of the following resume, concluding with key strengths:
    {query_with_chunks}
    '''


# In[121]:


def resume_weakness(query_with_chunks):
    """Analyzes weaknesses in the resume and suggests improvements."""
    return f'''
    Analyze and explain the weaknesses of the following resume and provide improvement suggestions:
    {query_with_chunks}
    '''


# In[122]:


def job_title_suggestion(query_with_chunks):
    """Suggests job roles based on the resume."""
    return f'''
    Based on the skills, experience, and qualifications in this resume, suggest suitable job roles along with industry recommendations:
    {query_with_chunks}
    '''


# In[123]:


# Generate and analyze resume summary
summary_query = resume_summary(query_with_chunks=text)
summary_result = gemini_analysis(chunks, summary_query)
print("\nResume Summary:\n", summary_result)


# In[124]:


# Analyze resume strengths
strength_query = resume_strength(query_with_chunks=summary_result)
strength_result = gemini_analysis(chunks, strength_query)
print("\nResume Strengths:\n", strength_result)


# In[18]:


pip install tiktoken


# In[125]:


# Analyze resume weaknesses and improvements
weakness_query = resume_weakness(query_with_chunks=summary_result)
weakness_result = gemini_analysis(chunks, weakness_query)
print("\nResume Weaknesses and Improvements:\n", weakness_result)


# In[126]:


# Suggest job titles
job_suggestion_query = job_title_suggestion(query_with_chunks=summary_result)
job_suggestions = gemini_analysis(chunks, job_suggestion_query)
print("\nSuggested Job Titles:\n", job_suggestions)


# In[ ]:





# In[ ]:





# In[ ]:





# In[ ]:





# In[ ]:




