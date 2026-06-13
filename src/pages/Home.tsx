import { useState } from "react";
import { Link } from "react-router-dom";
import { getHomePageData, getPracticePageData } from "../utils/contentStore";

export default function Home() {
  const [heroCollapsed, setHeroCollapsed] = useState(false);
  const data = getHomePageData();
  const categories = getPracticePageData().categories;

  return (
    <div className="page-content page-home">
      <section className={`home-hero panel ${heroCollapsed ? "collapsed" : ""}`}>
        <button
          type="button"
          className="home-hero-toggle"
          onClick={() => setHeroCollapsed((value) => !value)}
          aria-expanded={!heroCollapsed}
        >
          {heroCollapsed ? "+" : "−"}
        </button>
        <div className="home-hero-copy">
          <div className="home-eyebrow">{data.title}</div>
          <h1 className="home-hero-title">{data.headline}</h1>
          {!heroCollapsed && (
            <>
              <p className="home-hero-description">{data.summary}</p>
              <div className="home-hero-features" dangerouslySetInnerHTML={{ __html: data.featureHtml }} />
              <div className="home-hero-actions">
            <Link to="/practice/react" className="hero-cta">
              Start a focused session
            </Link>
            <Link to="/practice/angular" className="hero-secondary">
              Explore categories
            </Link>
          </div>
        </>
      )}
        </div>
      </section>

      <section className="home-categories panel">
        <div className="category-group">
          <div className="category-group-header">Concept</div>
          <div className="home-shelf-grid">
            {categories
              .filter((c) => ["angular-concepts", "solid"].includes(c.key))
              .map((category) => (
                <Link
                  key={category.key}
                  to={`/practice/${category.key}`}
                  className="category-card-netflix"
                  style={{
                    borderLeftColor: category.color,
                    backgroundColor: `${category.color}15`,
                  }}
                >
                  <div className="category-netflix-icon">{category.icon}</div>
                  <div className="category-netflix-content">
                    <div className="category-netflix-title">{category.label}</div>
                    <p className="category-netflix-subtitle">{category.description}</p>
                  </div>
                  <div className="category-card-cta">Explore</div>
                </Link>
              ))}
          </div>
        </div>

        <div className="category-group">
          <div className="category-group-header">Code</div>
          <div className="home-shelf-grid">
            {categories
              .filter((c) => ["react", "angular", "csharp", "sql"].includes(c.key))
              .map((category) => (
                <Link
                  key={category.key}
                  to={`/practice/${category.key}`}
                  className="category-card-netflix"
                  style={{
                    borderLeftColor: category.color,
                    backgroundColor: `${category.color}15`,
                  }}
                >
                  <div className="category-netflix-icon">{category.icon}</div>
                  <div className="category-netflix-content">
                    <div className="category-netflix-title">{category.label}</div>
                    <p className="category-netflix-subtitle">{category.description}</p>
                  </div>
                  <div className="category-card-cta">Explore</div>
                </Link>
              ))}
          </div>
        </div>
      </section>
    </div>
  );
}
