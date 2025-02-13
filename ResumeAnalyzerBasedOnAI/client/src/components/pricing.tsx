import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const plans = [
  {
    name: "Basic",
    price: "Free",
    features: [
      "1 Resume Analysis",
      "Basic ATS Check",
      "Format Validation",
      "Email Support"
    ]
  },
  {
    name: "Pro",
    price: "$12",
    features: [
      "Unlimited Resume Analysis",
      "Advanced ATS Optimization",
      "Industry-specific Suggestions",
      "Priority Support",
      "Multiple Resume Versions"
    ]
  },
  {
    name: "Enterprise",
    price: "Custom",
    features: [
      "Everything in Pro",
      "Custom Integration",
      "Team Management",
      "Dedicated Support",
      "API Access"
    ]
  }
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 px-4 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Simple, Transparent Pricing
          </motion.h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that best fits your needs
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="border rounded-lg p-8 bg-background"
            >
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.price !== "Custom" && <span className="text-muted-foreground">/month</span>}
              </div>
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full">Get Started</Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
