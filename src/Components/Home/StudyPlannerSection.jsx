import { Link } from "react-router";
import { ArrowRight } from "lucide-react";

export default function StudyPlannerSection() {
  return (
    <section
      className="sh-planner-spotlight"
      id="study-planner-section"
      aria-labelledby="planner-spotlight-heading"
    >
      <div className="sh-planner-inner sh-shell">
        {/* Left Collage & Decorative Zone */}
        <div className="sh-planner-collage-zone" aria-hidden="true">
          {/* Taped paper scrap note */}
          <div className="sh-planner-note-card">
            <span className="sh-planner-tape" />
            <p>
              FOCUS
              <br />
              CREATES
              <br />
              FREEDOM.
            </p>
          </div>

          {/* Blue sketch arrow */}
          <svg
            className="sh-planner-blue-arrow"
            width="42"
            height="42"
            viewBox="0 0 42 42"
            fill="none"
          >
            <path
              d="M34 8 L10 32"
              stroke="#1b63d9"
              strokeWidth="2.6"
              strokeLinecap="round"
            />
            <path
              d="M10 32 L24 32"
              stroke="#1b63d9"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10 32 L10 18"
              stroke="#1b63d9"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M36 13 L15 34"
              stroke="#1b63d9"
              strokeWidth="1.6"
              strokeLinecap="round"
              opacity="0.5"
            />
          </svg>

          {/* Hand-drawn star doodle */}
          <svg
            className="sh-planner-star-doodle"
            width="46"
            height="46"
            viewBox="0 0 46 46"
            fill="none"
          >
            <path
              d="M23 4 L28 17 L41 18.5 L31 28 L34 41 L23 33.5 L12 41 L15 28 L5 18.5 L18 17 Z"
              stroke="#18181b"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {/* Coffee cup sticker / tag */}
          <div className="sh-planner-cup-tag">
            <span>To: Me</span>
          </div>
        </div>

        {/* Right Content Column */}
        <div className="sh-planner-content">
          <div className="sh-planner-badge-wrap">
            <span className="sh-planner-badge">STUDY PLANNER</span>
          </div>

          <h2 id="planner-spotlight-heading" className="sh-planner-heading">
            Turn Your Goals
            <br />
            Into <span className="sh-planner-highlight">Daily Progress.</span>
          </h2>

          <p className="sh-planner-desc">
            Break big goals into small, actionable tasks. Track your progress,
            stay motivated and build consistent study habits.
          </p>

          <ul className="sh-planner-checklist">
            <li>
              <span className="sh-planner-check" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M3.5 10.5L7.5 14.5L16.5 5.5"
                    stroke="#18181b"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M7.5 11.5L14.5 4.5"
                    stroke="#18181b"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.6"
                  />
                </svg>
              </span>
              <span>Create and organize tasks</span>
            </li>
            <li>
              <span className="sh-planner-check" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M3.5 10.5L7.5 14.5L16.5 5.5"
                    stroke="#18181b"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M7.5 11.5L14.5 4.5"
                    stroke="#18181b"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.6"
                  />
                </svg>
              </span>
              <span>Set deadlines and priorities</span>
            </li>
            <li>
              <span className="sh-planner-check" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M3.5 10.5L7.5 14.5L16.5 5.5"
                    stroke="#18181b"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M7.5 11.5L14.5 4.5"
                    stroke="#18181b"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.6"
                  />
                </svg>
              </span>
              <span>Track progress with analytics</span>
            </li>
            <li>
              <span className="sh-planner-check" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M3.5 10.5L7.5 14.5L16.5 5.5"
                    stroke="#18181b"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M7.5 11.5L14.5 4.5"
                    stroke="#18181b"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.6"
                  />
                </svg>
              </span>
              <span>Stay consistent and productive</span>
            </li>
          </ul>

          <div className="sh-planner-action-wrap">
            <Link to="/study-planner" className="sh-planner-btn">
              Try Study Planner
              <ArrowRight size={17} strokeWidth={2.4} />
            </Link>

            {/* Hand-drawn sketchy arrow pointing to the button */}
            <div className="sh-planner-arrow-doodle" aria-hidden="true">
              <svg width="68" height="66" viewBox="0 0 68 66" fill="none">
                <path
                  d="M58 58 C 62 39, 48 23, 24 18 C 18 16.8, 11 17.5, 4 20"
                  stroke="#18181b"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                <path
                  d="M4 20 L 16 11"
                  stroke="#18181b"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                <path
                  d="M4 20 L 13 29"
                  stroke="#18181b"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
