import { useState } from 'react'
import Field from '../components/Field'
import PageHead from '../components/PageHead'
import Sent from '../components/Sent'
import { useContent } from '../contentState'
import { useTitle } from '../useTitle'

export default function Audition() {
  const { audition } = useContent()
  const [sent, setSent] = useState(false)
  useTitle('Audition')

  function onSubmit(event) {
    event.preventDefault()
    setSent(true)
  }

  return (
    <div className="wrap page">
      <PageHead eyebrow="Audition" title="오디션" desc={audition.intro} />
      <div className="split">
        <div className="stack">
          <section className="panel">
            <h2>모집 분야</h2>
            <p>{audition.tracks.join(' · ')}</p>
          </section>
          <section className="panel">
            <h2>지원 자격</h2>
            <ul>
              {audition.qualification.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
          <section className="panel">
            <h2>일정</h2>
            <ul className="schedule">
              {audition.schedule.map((item) => (
                <li key={item.label}>
                  <strong>{item.label}</strong>
                  <span>{item.value}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {sent ? (
          <Sent title="지원서가 접수되었습니다" />
        ) : (
          <form className="form-card" onSubmit={onSubmit}>
            <h2>지원서</h2>
            <div className="form-grid">
              <Field label="이름">
                <input name="name" required autoComplete="name" />
              </Field>
              <Field label="생년월일">
                <input name="birth" type="date" required />
              </Field>
              <Field label="연락처">
                <input name="phone" type="tel" required autoComplete="tel" />
              </Field>
              <Field label="이메일">
                <input name="email" type="email" required autoComplete="email" />
              </Field>
              <Field label="지원 분야" className="wide">
                <select name="track" required defaultValue="">
                  <option value="" disabled>
                    선택
                  </option>
                  {audition.tracks.map((track) => (
                    <option key={track} value={track}>
                      {track}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="자기소개" className="wide">
                <textarea name="intro" required placeholder="무대에서 보여주고 싶은 것을 적어 주세요." />
              </Field>
            </div>
            <button className="btn" type="submit">
              지원하기
            </button>
            <p className="note">지금은 화면 확인용이라 내용이 전송되지 않습니다.</p>
          </form>
        )}
      </div>
    </div>
  )
}
