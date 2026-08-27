/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { UserFeedback } from "../types";
import { MessageSquare, Star, Send, CheckCircle2, Sparkles } from "lucide-react";

interface FeedbackSectionProps {
  feedbacks: UserFeedback[];
  onSubmitFeedback: (feedback: Omit<UserFeedback, "id" | "pushedToHome" | "status" | "createdAt">) => void;
}

export default function FeedbackSection({
  feedbacks,
  onSubmitFeedback,
}: FeedbackSectionProps) {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [productPurchased, setProductPurchased] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [submittedMessage, setSubmittedMessage] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) return;

    onSubmitFeedback({
      name: name.trim(),
      city: city.trim() || "Maharashtra",
      productPurchased: productPurchased.trim() || "FNB Furniture",
      comment: comment.trim(),
      rating,
    });

    setSubmittedMessage(true);
    setName("");
    setCity("");
    setProductPurchased("");
    setComment("");
    setRating(5);

    setTimeout(() => {
      setSubmittedMessage(false);
    }, 6000);
  };

  // Only display approved or pushed to home feedbacks publicly
  const publicFeedbacks = feedbacks.filter(
    (fb) => fb.status === "Approved" || fb.pushedToHome
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:py-12 sm:px-6 lg:px-8 space-y-12">
      {/* Header Banner - Responsive and aligned with other tab headers */}
      <div className="text-center space-y-3 sm:space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center space-x-1.5 rounded-full bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-800 uppercase tracking-wider">
          <Sparkles className="h-3.5 w-3.5 text-amber-700" />
          <span>Client Voices & Feedback</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight text-stone-900">
          Share Your FNB Experience
        </h1>
        <p className="text-xs sm:text-sm font-normal text-stone-500 leading-relaxed max-w-xl mx-auto">
          Your feedback and direct reviews drive our master woodworking and customer service at the Chandoli manufacturing factory.
        </p>
      </div>

      {/* Submission Form Container */}
      <div className="max-w-3xl mx-auto">
        <div className="rounded-2xl sm:rounded-3xl border border-stone-200 bg-white p-5 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center space-x-3 border-b border-stone-100 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-900 text-white shadow-xs">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
                Submit Your Review
              </h3>
              <p className="text-xs text-stone-500 font-normal">
                Directly sent to FNB Admin Panel for review & verification
              </p>
            </div>
          </div>

          {submittedMessage && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-900 space-y-1 animate-fadeIn">
              <div className="flex items-center space-x-2 font-bold text-emerald-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Feedback Received!</span>
              </div>
              <p className="text-emerald-700 leading-relaxed pl-6 text-xs font-normal">
                Thank you! Your feedback has been sent to our administrator team. Once verified, it will be published to the home screen.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
                Your Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="E.g. Dr. Rajesh Patil"
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3.5 py-2.5 text-xs sm:text-sm text-stone-900 focus:border-amber-800 focus:bg-white focus:outline-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
                  City / Location *
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="E.g. Manchar, Pune"
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3.5 py-2.5 text-xs sm:text-sm text-stone-900 focus:border-amber-800 focus:bg-white focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
                  Furniture / Service *
                </label>
                <input
                  type="text"
                  required
                  value={productPurchased}
                  onChange={(e) => setProductPurchased(e.target.value)}
                  placeholder="E.g. Teak Sofa & Dining"
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3.5 py-2.5 text-xs sm:text-sm text-stone-900 focus:border-amber-800 focus:bg-white focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Star Rating selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
                Overall Experience Rating *
              </label>
              <div className="flex items-center space-x-2 bg-stone-50 border border-stone-200 p-2.5 rounded-xl">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-110 cursor-pointer"
                  >
                    <Star
                      className={`h-5 w-5 sm:h-6 sm:w-6 ${
                        (hoverRating || rating) >= star
                          ? "fill-amber-400 text-amber-500"
                          : "text-stone-300"
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-xs font-bold text-amber-900">
                  {rating} of 5 Stars
                </span>
              </div>
            </div>

            {/* Feedback details */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
                Detailed Feedback & Comments *
              </label>
              <textarea
                required
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share how the furniture looks in your home, wood quality, cushioning, or assembly service..."
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3.5 py-2.5 text-xs sm:text-sm text-stone-900 focus:border-amber-800 focus:bg-white focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center space-x-2 rounded-xl bg-amber-900 hover:bg-amber-955 px-6 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-md transition-all active:scale-98 cursor-pointer"
            >
              <Send className="h-4 w-4" />
              <span>Submit Feedback to Admin</span>
            </button>
          </form>
        </div>
      </div>

      {/* Verified Client Experiences Showcase */}
      {publicFeedbacks.length > 0 && (
        <div className="space-y-6 pt-6 border-t border-stone-200 max-w-7xl mx-auto">
          <div className="text-center space-y-1">
            <span className="text-xs font-bold tracking-widest text-amber-800 uppercase">
              Verified Testimonials
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
              Recent Client Stories
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {publicFeedbacks.map((fb) => (
              <div
                key={fb.id}
                className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 space-y-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1 text-amber-500">
                      {Array.from({ length: fb.rating }).map((_, i) => (
                        <span key={i}>★</span>
                      ))}
                    </div>
                    <span className="inline-flex items-center space-x-1 rounded-full bg-emerald-100/80 border border-emerald-300 text-emerald-900 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider">
                      <CheckCircle2 className="h-3 w-3 text-emerald-700" />
                      <span>Verified Client</span>
                    </span>
                  </div>

                  {fb.imageUrl && (
                    <div className="h-40 w-full overflow-hidden rounded-xl border border-stone-200 bg-stone-100">
                      <img src={fb.imageUrl} alt={fb.name} className="h-full w-full object-cover" />
                    </div>
                  )}

                  <p className="text-xs sm:text-sm font-normal text-stone-700 italic leading-relaxed">
                    "{fb.comment}"
                  </p>
                </div>

                <div className="border-t border-stone-100 pt-3 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="h-9 w-9 rounded-full bg-amber-900 text-amber-100 flex items-center justify-center text-xs font-bold uppercase shrink-0 shadow-xs">
                      {fb.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-stone-900">{fb.name}</h4>
                      <span className="text-[10px] sm:text-xs text-stone-500 block font-normal">
                        {fb.city || "Maharashtra"} {fb.productPurchased ? `• ${fb.productPurchased}` : ""}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
