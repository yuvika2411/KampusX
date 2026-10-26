"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    {
      category: "Privacy & Identity",
      question: "How is reporter accountability and privacy handled?",
      answer:
        "To maintain accountability and prevent spam or duplicate complaints, issue reporting requires sign-in with your institutional email and password. In-app visibility emphasizes the issue location and description to help maintenance staff take action quickly while protecting your personal credentials.",
    },
    {
      category: "Administration & Workflow",
      question: "Who reviews and addresses the reported issues?",
      answer:
        "Issues are organized by location and category to reach the relevant campus department. For instance, hostel plumbing and electrical issues relate to the hostel caretaking and estate staff; Wi-Fi and lab computer issues relate to campus IT coordinators; and classroom infrastructure relates to the estate maintenance unit.",
    },
    {
      category: "Community Features",
      question: "How does the community upvoting mechanism work?",
      answer:
        "When an issue is posted, fellow students who notice the same issue can upvote it. Issues with higher upvote counts are highlighted on campus feed views and administrative queues, helping maintenance teams identify which campus issues have the broadest student impact without creating duplicate tickets.",
    },
    {
      category: "Accountability & Monitoring",
      question: "How are resolution targets monitored?",
      answer:
        "Categories have suggested target turnaround benchmarks (such as 12 to 48 hours for urgent utilities). Dashboards display open tickets by priority so department teams and student representatives can track unresolved items transparently.",
    },
    {
      category: "Quality Assurance",
      question: "How does resolution verification work?",
      answer:
        "Technicians log resolution notes or photos upon completing repairs. The student who originally reported the issue can view the update and provide feedback on whether the issue has been adequately resolved.",
    },
    {
      category: "Eligibility & Access",
      question: "Who can use the KampusX platform?",
      answer:
        "KampusX is designed for students, hostellers, and staff across KIET Group of Institutions. Access will be supported via institutional email and password authentication, connecting directly to the Spring Boot backend.",
    },
  ];

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 md:py-28 bg-page border-t border-line">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-soft text-indigo-500 border border-line">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
            Frequently Asked Questions
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
            Got Questions? We’ve Got Answers.
          </h2>
          <p className="mt-4 text-base text-mute leading-relaxed">
            Everything you need to know about reporting, upvoting, and campus resolution policies.
          </p>
        </div>

        {/* Accordion List */}
        <div className="mt-12 space-y-3.5">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.question}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? "bg-soft/70 border-[#818cf8] shadow-sm"
                    : "bg-card border-line hover:border-[#818cf8]/50"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#818cf8] rounded-2xl"
                  aria-expanded={isOpen}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-500 bg-soft px-2 py-0.5 rounded border border-line self-start sm:self-auto">
                      {faq.category}
                    </span>
                    <span className="text-base font-bold text-ink">
                      {faq.question}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-mute shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-indigo-500" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-sm text-mute leading-relaxed border-t border-line animate-in fade-in duration-200">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Support Note */}
        <div className="mt-10 p-5 rounded-2xl bg-soft border border-line flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <h4 className="text-sm font-bold text-ink">
              Have a specific question not covered here?
            </h4>
            <p className="text-xs text-mute mt-0.5">
              Reach out directly to the KIET Student Welfare & Technical Support Desk.
            </p>
          </div>
          <a
            href="mailto:support@kampusx.kiet.edu"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-card text-ink border border-line hover:bg-soft shadow-xs transition-colors shrink-0"
          >
            Contact Campus Desk
          </a>
        </div>
      </div>
    </section>
  );
}
