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
            <Link key={category.key} to={`/practice/${category.key}`} className="category-card">
              <div className="category-card-title">{category.label}</div>
              <p className="category-card-subtitle">Tap to start a focused task sequence</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
