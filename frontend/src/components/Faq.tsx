"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle, ExternalLink } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    {
      category: "Eligibility & Access",
      question: "Who can use the KampusX platform?",
      answer:
        "KampusX is designed exclusively for verified students and staff of KIET Group of Institutions. Access requires an active institutional @kiet.edu email address.",
    },
    {
      category: "Authentication",
      question: "How does authentication work?",
      answer:
        "KampusX uses secure email OTP (One-Time Password) verification. Upon entering your @kiet.edu email, a 6-digit code is dispatched directly to your inbox. There is no need to remember or manage passwords for signing in.",
    },
    {
      category: "Administration & Workflow",
      question: "Who reviews and addresses reported issues?",
      answer:
        "Issues are routed directly to the designated Category Head (such as Hostel Wardens, Campus IT Cell, Estate Maintenance, or Academic Lab Coordinators). The Category Head reviews the ticket queue and assigns a field Resolver (technician) to handle the physical repair.",
    },
    {
      category: "Privacy & Identity",
      question: "What reporter information is visible to other users?",
      answer:
        "The issue title, description, category, and building location are visible on the campus feed so peers can upvote and add comments. Reporter emails and private credentials are never shared publicly.",
    },
    {
      category: "Community Features",
      question: "How does community upvoting work?",
      answer:
        "When an issue is posted, fellow students affected by the same problem can upvote the ticket. Upvotes highlight widespread campus concerns on Category Head triage queues, helping maintenance teams prioritize without duplicate tickets being filed.",
    },
    {
      category: "Verification & Sign-off",
      question: "How does resolution verification work?",
      answer:
        "Once the assigned field Resolver finishes work and sets the status to RESOLVED, the original student reporter can confirm the fix by closing the ticket. If the repair is unsatisfactory or incomplete, the student can reopen the ticket with one click.",
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
              Have questions regarding campus maintenance policies?
            </h4>
            <p className="text-xs text-mute mt-0.5">
              Contact the KIET Dean of Student Welfare (DSW) or your respective Hostel Warden Office.
            </p>
          </div>
          <a
            href="https://www.kiet.edu"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-card text-ink border border-line hover:bg-soft shadow-xs transition-colors shrink-0"
          >
            <span>Visit kiet.edu</span>
            <ExternalLink className="w-3 h-3 text-mute" />
          </a>
        </div>
      </div>
    </section>
  );
}
