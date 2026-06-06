import { useState } from "react";
import { Link } from "react-router-dom";
import { categories } from "../data/tasks";
import { homePageData } from "../pageData/homePage";

export default function Home() {
  const data = homePageData;
  const [heroExpanded, setHeroExpanded] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  return (
    <div className="page-content page-home">
      <section className="home-hero panel">
        <div className="hero-copy">
          <p className="page-tag">{data.title}</p>
          <h2 className="hero-title">{data.headline}</h2>
          <p className={`hero-description ${heroExpanded ? "expanded" : "clamped"}`}>{data.summary}</p>
          <button className="panel-toggle" onClick={() => setHeroExpanded((s) => !s)}>{heroExpanded ? "Show Less" : "Read More"}</button>
        </div>
      </section>

      <section className="home-categories panel">
        <div className="panel-heading">Choose a practice type</div>
        <div className="home-category-grid">
          {categories.map((category) => (
            <Link 
              key={category.key} 
              to={`/practice/${category.key}`} 
              className={`category-card-netflix ${expandedCard === category.key ? "expanded" : ""}`}
              style={{ 
                borderLeftColor: category.color,
                backgroundColor: `${category.color}15`
              }}
              onClick={() => setExpandedCard(null)}
            >
              <div className="category-netflix-icon">{category.icon}</div>
              <div className="category-netflix-content">
                <div className="category-netflix-title">{category.label}</div>
                <p className={`category-netflix-subtitle ${expandedCard === category.key ? "expanded" : "clamped"}`}>
                  {category.description ?? "Master coding fundamentals"}
                </p>
              </div>
              <div className="category-netflix-arrow">→</div>
              <button
                className="card-expand"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setExpandedCard(expandedCard === category.key ? null : category.key); }}
                aria-expanded={expandedCard === category.key}
              >
                {expandedCard === category.key ? "▾" : "▸"}
              </button>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
