import type { Lang, Service, SiteSettings } from "@/lib/types";

function Counter({ value }: { value: number }) {
  return (
    <>
      <span data-count-to={value} aria-hidden="true">
        {value}
      </span>
      <span className="visually-hidden">{value}</span>
    </>
  );
}

export function Rhythm({
  lang,
  services,
  settings,
}: {
  lang: Lang;
  services: Service[];
  settings: SiteSettings;
}) {
  const active = services.filter((service) => service.active);
  if (!active.length) return null;
  const durations = active.map((service) => service.duration);
  const shortest = Math.min(...durations);
  const longest = Math.max(...durations);
  const copy = (key: string) => settings.copy[key][lang];
  return (
    <section className="rhythm-section container" data-scroll-meter aria-labelledby="rhythm-title">
      <div className="rhythm-copy">
        <span className="eyebrow">{copy("rhythmEyebrow")}</span>
        <h2 id="rhythm-title">{copy("rhythmTitle")}</h2>
        <p>{copy("rhythmIntro")}</p>
        <div className="rhythm-metrics">
          <div>
            <strong>
              <Counter value={active.length} />
            </strong>
            <span>{copy("rhythmServices")}</span>
          </div>
          <div>
            <strong>
              <Counter value={shortest} />
              {shortest !== longest && (
                <>
                  -<Counter value={longest} />
                </>
              )}
              <small> min</small>
            </strong>
            <span>{copy("rhythmDuration")}</span>
          </div>
        </div>
      </div>
      <div className="rhythm-chart">
        <div className="rhythm-chart-heading">
          <span className="rhythm-orbit" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <h3>{copy("rhythmChartTitle")}</h3>
        </div>
        <div className="duration-chart" role="list" aria-label={copy("rhythmChartTitle")}>
          {active.map((service) => (
            <div className="duration-row" key={service.id} role="listitem">
              <div>
                <span>{service.title[lang]}</span>
                <strong>
                  <Counter value={service.duration} /> min
                </strong>
              </div>
              <div className="duration-track" aria-hidden="true">
                <span
                  style={{ "--duration-ratio": service.duration / longest } as React.CSSProperties}
                />
              </div>
            </div>
          ))}
        </div>
        <p>{copy("rhythmChartNote")}</p>
      </div>
    </section>
  );
}
