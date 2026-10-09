import PageHead from '../components/PageHead'
import { useContent } from '../contentState'
import { useTitle } from '../useTitle'

export default function About() {
  const { company } = useContent()
  useTitle('About')

  return (
    <div className="wrap page">
      <PageHead eyebrow="About" title="회사 소개" desc={company.tagline} />
      <p className="about-lead">{company.about}</p>
      <p className="about-copy">{company.summary}</p>

      <h2 className="block-title">하는 일</h2>
      <div className="work-grid">
        {company.works.map((work) => (
          <article key={work.title} className="card">
            <h3>{work.title}</h3>
            <p>{work.text}</p>
          </article>
        ))}
      </div>

      <h2 className="block-title">연혁</h2>
      <ol className="timeline">
        {company.history.map((item) => (
          <li key={item.year}>
            <strong>{item.year}</strong>
            <span>{item.text}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
