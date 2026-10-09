import { useState } from 'react'
import Field from '../components/Field'
import PageHead from '../components/PageHead'
import Sent from '../components/Sent'
import { useContent } from '../contentState'
import { useTitle } from '../useTitle'

export default function Contact() {
  const { company, inquiryTypes } = useContent()
  const [sent, setSent] = useState(false)
  useTitle('Contact')

  function onSubmit(event) {
    event.preventDefault()
    setSent(true)
  }

  return (
    <div className="wrap page">
      <PageHead eyebrow="Contact" title="문의" desc="비즈니스, 제휴, 미디어 문의를 받습니다." />
      <div className="split">
        <dl className="contact-list">
          <div>
            <dt>이메일</dt>
            <dd>
              <a href={`mailto:${company.contact.email}`}>{company.contact.email}</a>
            </dd>
          </div>
          <div>
            <dt>전화</dt>
            <dd>{company.contact.phone}</dd>
          </div>
          <div>
            <dt>주소</dt>
            <dd>{company.contact.address}</dd>
          </div>
        </dl>

        {sent ? (
          <Sent title="문의가 접수되었습니다" />
        ) : (
          <form className="form-card" onSubmit={onSubmit}>
            <h2>문의하기</h2>
            <div className="form-grid">
              <Field label="이름">
                <input name="name" required autoComplete="name" />
              </Field>
              <Field label="이메일">
                <input name="email" type="email" required autoComplete="email" />
              </Field>
              <Field label="소속">
                <input name="org" autoComplete="organization" />
              </Field>
              <Field label="유형">
                <select name="type" required defaultValue="비즈니스">
                  {inquiryTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="내용" className="wide">
                <textarea name="message" required placeholder="문의 내용을 적어 주세요." />
              </Field>
            </div>
            <button className="btn" type="submit">
              보내기
            </button>
            <p className="note">지금은 화면 확인용이라 내용이 전송되지 않습니다.</p>
          </form>
        )}
      </div>
    </div>
  )
}
