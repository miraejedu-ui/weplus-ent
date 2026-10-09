export default function PageHead({ eyebrow, title, desc }) {
  return (
    <header className="page-head">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      {desc ? <p className="lede">{desc}</p> : null}
    </header>
  )
}
