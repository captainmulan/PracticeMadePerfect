import { useState } from "react";
import { Link } from "react-router-dom";
import { getHomePageData, getPracticePageData } from "../utils/contentStore";

export default function Home() {
  const data = getHomePageData();
  const categories = getPracticePageData().categories;
  const [heroExpanded, setHeroExpanded] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  return (
    <div className="page-content page-home">
      <section className={`hero-banner panel ${heroExpanded ? "expanded" : "collapsed"}`}>
        <button
          type="button"
          className="hero-banner-header"
          onClick={() => setHeroExpanded((s) => !s)}
          aria-expanded={heroExpanded}
        >
          <div className="hero-banner-summary">
            <div className="hero-banner-title-row">
              <h2 className="hero-title">{data.headline}</h2>
            </div>
          </div>
          <span className="hero-chevron" aria-hidden="true">
            {heroExpanded ? "▾" : "▸"}
          </span>
        </button>
        {heroExpanded && (
          <div className="hero-banner-body">
            <p className="hero-description">{data.summary}</p>
          </div>
        )}
      </section>

      <section className="home-categories panel">
        <div className="panel-heading">Choose a practice type</div>
        <div className="home-category-groups">
          <div className="home-category-group">
            <div className="home-category-group-title">1. IT</div>
            <div className="home-category-group-note">react, angular, C#, SQL</div>
            <div className="home-category-grid">
              {categories.map((category) => (
                <Link
                  key={category.key}
                  to={`/practice/${category.key}`}
                  className={`category-card-netflix ${expandedCard === category.key ? "expanded" : ""}`}
                  style={{
                    borderLeftColor: category.color,
                    backgroundColor: `${category.color}15`,
                  }}
                  onClick={() => setExpandedCard(null)}
                >
                  <div className="category-netflix-icon">{category.icon}</div>
                  <div className="category-netflix-content">
                    <div className="category-netflix-title">{category.label}</div>
                    {expandedCard === category.key && (
                      <p className="category-netflix-subtitle expanded">{category.description}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    className="card-expand"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setExpandedCard(expandedCard === category.key ? null : category.key);
                    }}
                    aria-expanded={expandedCard === category.key}
                    aria-label={expandedCard === category.key ? "Collapse details" : "Expand details"}
                  >
                    {expandedCard === category.key ? "▾" : "▸"}
                  </button>
                </Link>
              ))}
            </div>
          </div>

          <div className="home-category-group">
            <div className="home-category-group-title">2. Education</div>
            <div className="home-category-grid">
              <div className="category-card category-card-disabled">
                <div className="category-card-title">Education</div>
                <p className="category-card-subtitle">Coming soon</p>
              </div>
            </div>
          </div>

          <div className="home-category-group">
            <div className="home-category-group-title">3. Quizz</div>
            <div className="home-category-grid">
              <div className="category-card category-card-disabled">
                <div className="category-card-title">Quizz</div>
                <p className="category-card-subtitle">Coming soon</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
