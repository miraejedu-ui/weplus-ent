import { useState } from 'react'
import Field from '../components/Field'
import PageHead from '../components/PageHead'
import Sent from '../components/Sent'
import { formatDate } from '../data'
import { useContent } from '../contentState'
import { useTitle } from '../useTitle'

export default function Recruit() {
  const { jobs } = useContent()
  const [sent, setSent] = useState(false)
  const [position, setPosition] = useState('')
  useTitle('Recruit')

  function onSubmit(event) {
    event.preventDefault()
    setSent(true)
  }

  function choose(id) {
    setPosition(id)
    setSent(false)
    document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="wrap page">
      <PageHead eyebrow="Recruit" title="채용" desc="위플러스엔트와 함께 일할 사람을 찾습니다." />
      <div className="jobs">
        {jobs.map((job) => (
          <article key={job.id} className="job">
            <div>
              <h2>{job.title}</h2>
              <p className="meta-line">
                {job.team} · {job.type} · 마감 {formatDate(job.deadline)}
              </p>
            </div>
            <button type="button" className="text-btn" onClick={() => choose(job.id)}>
              이 직무로 지원
            </button>
            <p>{job.summary}</p>
          </article>
        ))}
      </div>

      {sent ? (
        <Sent title="지원서가 접수되었습니다" />
      ) : (
        <form id="apply" className="form-card" onSubmit={onSubmit}>
          <h2>지원서</h2>
          <div className="form-grid">
            <Field label="이름">
              <input name="name" required autoComplete="name" />
            </Field>
            <Field label="이메일">
              <input name="email" type="email" required autoComplete="email" />
            </Field>
            <Field label="연락처">
              <input name="phone" type="tel" required autoComplete="tel" />
            </Field>
            <Field label="지원 직무">
              <select name="position" required value={position} onChange={(event) => setPosition(event.target.value)}>
                <option value="" disabled>
                  선택
                </option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="소개" className="wide">
              <textarea name="intro" required placeholder="맡고 싶은 일과 경험을 적어 주세요." />
            </Field>
          </div>
          <button className="btn" type="submit">
            지원하기
          </button>
          <p className="note">지금은 화면 확인용이라 내용이 전송되지 않습니다.</p>
        </form>
      )}
    </div>
  )
}
