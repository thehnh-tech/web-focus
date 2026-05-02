const tickerItems = Array.from({ length: 10 }, (_, index) => index);

export function AnnouncementBar() {
  return (
    <div className="announcement-bar" aria-label="Site announcement">
      <div className="ticker-track">
        {tickerItems.map((item) => (
          <span className="ticker-item" key={item}>
            TRAIN HARDER. STAY FOCUSED. <span aria-hidden="true">|</span>
          </span>
        ))}
      </div>
    </div>
  );
}
