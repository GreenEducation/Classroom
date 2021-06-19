import styles from './card.module.scss'

export default function Card({ className, children }) {
  return (
    <div className={className + ' ' + styles.card}>
      { children }
    </div>
  )
}

Card.defaultProps = {
  className: ''
};