import { useEffect, useState } from "react";

type Rates = {
  NZD?: number;
  SGD?: number;
  MMK?: number;
  USD?: number;
  date?: string;
};

const CACHE_KEY = "exchangeRates_cache";
const CACHE_EXPIRY_KEY = "exchangeRates_expiry";
const CACHE_DURATION_MS = 3600000; // 1 hour

export default function ExchangeRatePanel() {
  const [rates, setRates] = useState<Rates | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCached, setIsCached] = useState(false);

  const getCachedRates = () => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      const expiry = localStorage.getItem(CACHE_EXPIRY_KEY);
      if (cached && expiry && Date.now() < parseInt(expiry, 10)) {
        return JSON.parse(cached) as Rates;
      }
    } catch (e) {
      // ignore localStorage errors
    }
    return null;
  };

  const setCachedRates = (r: Rates) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(r));
      localStorage.setItem(CACHE_EXPIRY_KEY, String(Date.now() + CACHE_DURATION_MS));
    } catch (e) {
      // ignore localStorage errors
    }
  };

  useEffect(() => {
    let mounted = true;
    async function fetchRates() {
      try {
        setLoading(true);
        setError(null);

        // Try primary API (exchangerate-api.com free tier)
        const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD", {
          headers: { "Accept": "application/json" },
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!mounted) return;

        const r = data?.rates ?? {};
        if (!r || Object.keys(r).length === 0) {
          throw new Error("No rate data in response");
        }

        const newRates = { NZD: r.NZD, SGD: r.SGD, MMK: r.MMK, USD: r.USD ?? 1, date: data.date };
        setRates(newRates);
        setCachedRates(newRates);
        setIsCached(false);
      } catch (err: any) {
        if (mounted) {
          const cached = getCachedRates();
          if (cached) {
            setRates(cached);
            setIsCached(true);
            setError(null);
          } else {
            setError(err.message ?? String(err));
          }
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchRates();
    const interval = setInterval(fetchRates, 300_000); // refresh every 5 minutes
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  return (
    <div className="exchange-rate-panel">
      <div className="exchange-rate-panel-inner">
        <div className="exchange-rate-heading">
          <strong>Exchange (base USD)</strong>
          {isCached && <span>cached</span>}
          {rates?.date && <span>{rates.date}</span>}
        </div>
        <div className="exchange-rate-values">
          {loading && !rates && <div>Loading...</div>}
          {error && !rates && <div className="exchange-rate-error">{error}</div>}
          {rates && (
            <>
              <div>SGD <strong>{rates.SGD?.toFixed(4) ?? "-"}</strong></div>
              <div>MMK <strong>{rates.MMK?.toFixed(2) ?? "-"}</strong></div>
              <div>USD <strong>1.0000</strong></div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
