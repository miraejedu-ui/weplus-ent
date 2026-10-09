import { useEffect, useState } from 'react'
import Field from '../components/Field'
import { useContent } from '../contentState'
import { media } from '../media'
import { useTitle } from '../useTitle'

const tabs = ['홈', 'About', 'Artist', 'News', 'Notice', 'Audition', 'Recruit', 'Contact']

export default function Admin() {
  const content = useContent()
  const [user, setUser] = useState(null)
  const [checked, setChecked] = useState(false)
  const [draft, setDraft] = useState(null)
  const [tab, setTab] = useState('홈')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  useTitle('Admin')

  useEffect(() => {
    fetch('/api/me', { credentials: 'include' })
      .then((response) => response.json())
      .then((data) => setUser(data.ok ? data.email : ''))
      .finally(() => setChecked(true))
  }, [])

  useEffect(() => {
    if (!user || !content.loaded || draft) return
    setDraft(cloneContent(content))
  }, [user, content, draft])

  async function save() {
    setSaving(true)
    setMessage('')
    const response = await fetch('/api/content', {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draft),
    })
    const data = await response.json().catch(() => ({}))
    setSaving(false)
    if (response.status === 401) {
      setUser('')
      setMessage('다시 로그인해 주세요.')
      return
    }
    if (!response.ok) {
      setMessage(data.message || '저장하지 못했습니다.')
      return
    }
    setDraft(cloneContent(data))
    await content.reload()
    setMessage('저장했습니다. 사이트에 반영되었습니다.')
  }

  async function logout() {
    await fetch('/api/logout', { method: 'POST', credentials: 'include' })
    setUser('')
    setDraft(null)
  }

  if (!checked) return <div className="wrap page"><p>확인 중</p></div>
  if (!user) return <Login onSuccess={setUser} />
  if (!draft) return <div className="wrap page"><p>내용을 불러오는 중</p></div>

  return (
    <div className="wrap page admin">
      <header className="page-head">
        <p className="eyebrow">Admin</p>
        <h1>관리</h1>
        <p className="lede">{user}</p>
      </header>
      <div className="admin-bar">
        <button className="btn" type="button" onClick={save} disabled={saving}>
          {saving ? '저장 중' : '저장'}
        </button>
        <button className="text-btn" type="button" onClick={logout}>
          로그아웃
        </button>
        {message ? <p className="note">{message}</p> : null}
      </div>
      <div className="admin-tabs">
        {tabs.map((item) => (
          <button key={item} type="button" className={item === tab ? 'on' : ''} onClick={() => setTab(item)}>
            {item}
          </button>
        ))}
      </div>
      {tab === '홈' ? <HomeFields draft={draft} setDraft={setDraft} /> : null}
      {tab === 'About' ? <AboutFields draft={draft} setDraft={setDraft} /> : null}
      {tab === 'Artist' ? <ArtistFields draft={draft} setDraft={setDraft} /> : null}
      {tab === 'News' ? (
        <PostFields
          items={draft.news}
          artists={draft.artists}
          onChange={(news) => setDraft({ ...draft, news })}
        />
      ) : null}
      {tab === 'Notice' ? (
        <PostFields items={draft.notices} onChange={(notices) => setDraft({ ...draft, notices })} />
      ) : null}
      {tab === 'Audition' ? <AuditionFields draft={draft} setDraft={setDraft} /> : null}
      {tab === 'Recruit' ? <JobFields draft={draft} setDraft={setDraft} /> : null}
      {tab === 'Contact' ? <ContactFields draft={draft} setDraft={setDraft} /> : null}
    </div>
  )
}

function Login({ onSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [pending, setPending] = useState(false)

  async function onSubmit(event) {
    event.preventDefault()
    setPending(true)
    setMessage('')
    const response = await fetch('/api/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await response.json().catch(() => ({}))
    setPending(false)
    if (!response.ok) {
      setMessage(data.message || '로그인하지 못했습니다.')
      return
    }
    setPassword('')
    onSuccess(data.email)
  }

  return (
    <div className="wrap page">
      <form className="form-card admin-login" onSubmit={onSubmit}>
        <h1>관리자 로그인</h1>
        <Field label="아이디">
          <input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </Field>
        <Field label="비밀번호">
          <input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        </Field>
        {message ? <p className="note">{message}</p> : null}
        <button className="btn" type="submit" disabled={pending}>
          {pending ? '확인 중' : '로그인'}
        </button>
      </form>
    </div>
  )
}

function HomeFields({ draft, setDraft }) {
  return (
    <section className="form-card admin-stack">
      <h2>홈 사진</h2>
      <ImageField label="첫 화면 사진" value={draft.home.heroImage} onChange={(heroImage) => setDraft({ ...draft, home: { ...draft.home, heroImage } })} />
      <ImageField label="About 박스 사진" value={draft.home.aboutImage} onChange={(aboutImage) => setDraft({ ...draft, home: { ...draft.home, aboutImage } })} />
      <Field label="한 줄 소개">
        <input value={draft.company.summary} onChange={(event) => setDraft({ ...draft, company: { ...draft.company, summary: event.target.value } })} />
      </Field>
    </section>
  )
}

function AboutFields({ draft, setDraft }) {
  const company = draft.company
  function setCompany(patch) {
    setDraft({ ...draft, company: { ...company, ...patch } })
  }
  return (
    <div className="admin-stack">
      <section className="form-card">
        <h2>소개</h2>
        <Field label="문구">
          <input value={company.tagline} onChange={(event) => setCompany({ tagline: event.target.value })} />
        </Field>
        <Field label="본문">
          <textarea value={company.about} onChange={(event) => setCompany({ about: event.target.value })} />
        </Field>
      </section>
      <ListEditor
        title="하는 일"
        items={company.works}
        onChange={(works) => setCompany({ works })}
        blank={() => ({ title: '', text: '' })}
        render={(item, update) => (
          <>
            <Field label="제목"><input value={item.title} onChange={(event) => update({ title: event.target.value })} /></Field>
            <Field label="설명"><textarea value={item.text} onChange={(event) => update({ text: event.target.value })} /></Field>
          </>
        )}
      />
      <ListEditor
        title="연혁"
        items={company.history}
        onChange={(history) => setCompany({ history })}
        blank={() => ({ year: '', text: '' })}
        render={(item, update) => (
          <>
            <Field label="연도"><input value={item.year} onChange={(event) => update({ year: event.target.value })} /></Field>
            <Field label="내용"><input value={item.text} onChange={(event) => update({ text: event.target.value })} /></Field>
          </>
        )}
      />
    </div>
  )
}

function ArtistFields({ draft, setDraft }) {
  return (
    <ListEditor
      title="아티스트"
      items={draft.artists}
      onChange={(artists) => setDraft({ ...draft, artists })}
      blank={() => ({
        id: `artist-${Date.now()}`,
        name: '',
        role: '',
        image: '',
        gradient: 'linear-gradient(165deg, #477BFF 0%, #24345C 100%)',
        ink: '#FFFFFF',
        bio: '',
        activities: [],
      })}
      render={(item, update) => (
        <>
          <Field label="이름"><input value={item.name} onChange={(event) => update({ name: event.target.value })} /></Field>
          <Field label="역할"><input value={item.role} onChange={(event) => update({ role: event.target.value })} /></Field>
          <ImageField label="사진" value={item.image} onChange={(image) => update({ image })} />
          <Field label="소개"><textarea value={item.bio} onChange={(event) => update({ bio: event.target.value })} /></Field>
          <Field label="활동 (한 줄에 하나)">
            <textarea value={(item.activities || []).join('\n')} onChange={(event) => update({ activities: lines(event.target.value) })} />
          </Field>
        </>
      )}
    />
  )
}

function PostFields({ items, onChange, artists = [] }) {
  return (
    <ListEditor
      title="글"
      items={items}
      onChange={onChange}
      blank={() => ({
        id: `post-${Date.now()}`,
        artistId: '',
        date: new Date().toISOString().slice(0, 10),
        title: '',
        summary: '',
        body: [],
      })}
      render={(item, update) => (
        <>
          <Field label="날짜"><input type="date" value={item.date || ''} onChange={(event) => update({ date: event.target.value })} /></Field>
          <Field label="제목"><input value={item.title} onChange={(event) => update({ title: event.target.value })} /></Field>
          <Field label="요약"><input value={item.summary} onChange={(event) => update({ summary: event.target.value })} /></Field>
          {artists.length > 0 ? (
            <Field label="아티스트">
              <select value={item.artistId || ''} onChange={(event) => update({ artistId: event.target.value })}>
                <option value="">없음</option>
                {artists.map((artist) => (
                  <option key={artist.id} value={artist.id}>{artist.name || artist.id}</option>
                ))}
              </select>
            </Field>
          ) : null}
          <Field label="본문 (문단 사이는 빈 줄)">
            <textarea value={(item.body || []).join('\n\n')} onChange={(event) => update({ body: paragraphs(event.target.value) })} />
          </Field>
        </>
      )}
    />
  )
}

function AuditionFields({ draft, setDraft }) {
  const audition = draft.audition
  function setAudition(patch) {
    setDraft({ ...draft, audition: { ...audition, ...patch } })
  }
  return (
    <section className="form-card admin-stack">
      <h2>오디션</h2>
      <Field label="안내">
        <textarea value={audition.intro} onChange={(event) => setAudition({ intro: event.target.value })} />
      </Field>
      <Field label="모집 분야 (한 줄에 하나)">
        <textarea value={(audition.tracks || []).join('\n')} onChange={(event) => setAudition({ tracks: lines(event.target.value) })} />
      </Field>
      <Field label="지원 자격 (한 줄에 하나)">
        <textarea value={(audition.qualification || []).join('\n')} onChange={(event) => setAudition({ qualification: lines(event.target.value) })} />
      </Field>
      <ListEditor
        title="일정"
        items={audition.schedule || []}
        onChange={(schedule) => setAudition({ schedule })}
        blank={() => ({ label: '', value: '' })}
        render={(item, update) => (
          <>
            <Field label="항목"><input value={item.label} onChange={(event) => update({ label: event.target.value })} /></Field>
            <Field label="일정"><input value={item.value} onChange={(event) => update({ value: event.target.value })} /></Field>
          </>
        )}
      />
    </section>
  )
}

function JobFields({ draft, setDraft }) {
  return (
    <ListEditor
      title="채용"
      items={draft.jobs}
      onChange={(jobs) => setDraft({ ...draft, jobs })}
      blank={() => ({ id: `job-${Date.now()}`, title: '', team: '', type: '정규직', deadline: '', summary: '' })}
      render={(item, update) => (
        <>
          <Field label="직무"><input value={item.title} onChange={(event) => update({ title: event.target.value })} /></Field>
          <Field label="팀"><input value={item.team} onChange={(event) => update({ team: event.target.value })} /></Field>
          <Field label="형태"><input value={item.type} onChange={(event) => update({ type: event.target.value })} /></Field>
          <Field label="마감"><input type="date" value={item.deadline || ''} onChange={(event) => update({ deadline: event.target.value })} /></Field>
          <Field label="설명"><textarea value={item.summary} onChange={(event) => update({ summary: event.target.value })} /></Field>
        </>
      )}
    />
  )
}

function ContactFields({ draft, setDraft }) {
  const contact = draft.company.contact
  function setContact(patch) {
    setDraft({ ...draft, company: { ...draft.company, contact: { ...contact, ...patch } } })
  }
  return (
    <section className="form-card admin-stack">
      <h2>연락처</h2>
      <Field label="이메일"><input value={contact.email} onChange={(event) => setContact({ email: event.target.value })} /></Field>
      <Field label="전화"><input value={contact.phone} onChange={(event) => setContact({ phone: event.target.value })} /></Field>
      <Field label="주소"><input value={contact.address} onChange={(event) => setContact({ address: event.target.value })} /></Field>
      <Field label="문의 유형 (한 줄에 하나)">
        <textarea value={(draft.inquiryTypes || []).join('\n')} onChange={(event) => setDraft({ ...draft, inquiryTypes: lines(event.target.value) })} />
      </Field>
    </section>
  )
}

function ListEditor({ title, items, onChange, blank, render }) {
  function update(index, patch) {
    onChange(items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)))
  }
  return (
    <section className="admin-stack">
      <div className="section-head">
        <h2>{title}</h2>
        <button className="text-btn" type="button" onClick={() => onChange([...(items || []), blank()])}>
          추가
        </button>
      </div>
      {(items || []).map((item, index) => (
        <article key={item.id || `${title}-${index}`} className="form-card">
          {render(item, (patch) => update(index, patch))}
          <button className="text-btn danger" type="button" onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}>
            삭제
          </button>
        </article>
      ))}
    </section>
  )
}

function ImageField({ label, value, onChange }) {
  const [message, setMessage] = useState('')

  async function onFile(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setMessage('이미지 파일만 올릴 수 있습니다.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage('5MB 이하 사진만 올릴 수 있습니다.')
      return
    }
    setMessage('올리는 중')
    const data = await readDataUrl(file)
    const response = await fetch('/api/upload', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: file.name, data }),
    })
    const json = await response.json().catch(() => ({}))
    if (!response.ok) {
      setMessage(json.message || '업로드에 실패했습니다.')
      return
    }
    onChange(json.url)
    setMessage('사진을 올렸습니다. 저장을 눌러 반영하세요.')
  }

  return (
    <label className="field wide">
      <span>{label}</span>
      {value ? <img className="admin-preview" src={media(value)} alt="" /> : <span className="photo-slot admin-preview" />}
      <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={onFile} />
      {value ? (
        <button className="text-btn" type="button" onClick={() => onChange('')}>
          사진 빼기
        </button>
      ) : null}
      {message ? <span className="note">{message}</span> : null}
    </label>
  )
}

function readDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

function lines(value) {
  return value.split('\n').map((line) => line.trim()).filter(Boolean)
}

function paragraphs(value) {
  return value.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean)
}

function cloneContent(content) {
  return JSON.parse(JSON.stringify({
    home: content.home,
    company: content.company,
    artists: content.artists,
    news: content.news,
    notices: content.notices,
    audition: content.audition,
    inquiryTypes: content.inquiryTypes,
    jobs: content.jobs,
  }))
}
