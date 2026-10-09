export default function Sent({ title }) {
  return (
    <div className="sent" role="status">
      <h2>{title}</h2>
      <p>입력해 주셔서 감사합니다. 지금은 화면 확인용이라 내용이 저장되거나 전송되지 않습니다.</p>
    </div>
  )
}
