
export function SiteFooter({ photoCredit = false }: { photoCredit?: boolean }) {
  return (
    <footer className="site-footer on-rouge">
      <div className="wrap">
        <div className="footer-top">
          <h2 className="footer-title">A new destination edit every week.</h2>
          <div className="footer-cta">
            <p>What to wear in one city, one month at a time, with every piece linked to the shop that sells it.</p>
            <a className="btn btn--light" href="https://www.instagram.com/parchestoreofficial/" target="_blank" rel="noopener noreferrer">Follow @parchestoreofficial</a>
          </div>
        </div>
        <div className="footer-mark" aria-hidden><span className="wordmark" /></div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} parché. Shop links go to each retailer&apos;s own product page; parché may earn a commission on some purchases.</p>
          <p>
            {photoCredit && <> &nbsp; Photos: <a href="https://unsplash.com?utm_source=parche&utm_medium=referral" target="_blank" rel="noopener noreferrer">Unsplash</a></>}
            &nbsp; Weather: <a href="https://www.visualcrossing.com/" target="_blank" rel="noopener noreferrer">Visual Crossing</a>
          </p>
        </div>
      </div>
    </footer>
  )
}
