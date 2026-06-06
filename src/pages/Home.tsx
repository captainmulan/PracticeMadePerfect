import { Link } from "react-router-dom";
import { categories } from "../data/tasks";
import { homePageData } from "../pageData/homePage";

export default function Home() {
  const data = homePageData;

  return (
    <div className="page-content page-home">
      <section className="home-hero panel">
        <div className="hero-copy">
          <p className="page-tag">{data.title}</p>
          <h2 className="hero-title">{data.headline}</h2>
          <p className="hero-description">{data.summary}</p>
        </div>
      </section>

      <section className="home-categories panel">
        <div className="panel-heading">Choose a practice type</div>
        <div className="home-category-grid">
          {categories.map((category) => (
            <Link 
              key={category.key} 
              to={`/practice/${category.key}`} 
              className="category-card-netflix"
              style={{ 
                borderLeftColor: category.color,
                backgroundColor: `${category.color}15`
              }}
            >
              <div className="category-netflix-icon">{category.icon}</div>
              <div className="category-netflix-content">
                <div className="category-netflix-title">{category.label}</div>
                <p className="category-netflix-subtitle">Master coding fundamentals</p>
              </div>
              <div className="category-netflix-arrow">→</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
