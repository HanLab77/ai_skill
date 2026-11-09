import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css'
import './style.css'
import { startBackground } from './background.js'

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const canHover = window.matchMedia('(hover: hover)').matches

startBackground(document.querySelector('#math-bg'), { animate: !reducedMotion })

// 스크롤에 따라 콘텐츠 표시
const revealItems = document.querySelectorAll('.reveal')

if (reducedMotion || !('IntersectionObserver' in window)) {
  revealItems.forEach((item) => item.classList.add('is-visible'))
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-visible')
        observer.unobserve(entry.target)
      })
    },
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
  )
  revealItems.forEach((item) => observer.observe(item))
}

// 마우스 위치에 반응하는 카드
document.querySelectorAll('.card, .interest').forEach((card) => {
  if (!canHover) return

  card.addEventListener('pointermove', (event) => {
    const box = card.getBoundingClientRect()
    const x = (event.clientX - box.left) / box.width
    const y = (event.clientY - box.top) / box.height
    card.style.setProperty('--mx', `${x * 100}%`)
    card.style.setProperty('--my', `${y * 100}%`)
    if (!reducedMotion && card.classList.contains('card')) {
      card.style.setProperty('--ry', `${(x - 0.5) * 10}deg`)
      card.style.setProperty('--rx', `${(0.5 - y) * 10}deg`)
    }
  })

  card.addEventListener('pointerleave', () => {
    card.style.setProperty('--rx', '0deg')
    card.style.setProperty('--ry', '0deg')
  })
})

// 아직 주소를 넣지 않은 임시 링크는 이동하지 않도록 처리
document.querySelectorAll('[data-todo-link]').forEach((link) => {
  link.addEventListener('click', (event) => event.preventDefault())
})
