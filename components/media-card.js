import PropTypes from 'prop-types'
import Image from 'next/image'
import utilStyles from '../styles/utils.module.scss'
import styles from './media-card.module.scss'

export default function MediaCard
  ({ imgSrc, imgHeight, imgWidth, imgDesc, rounded, children }) {
  let cardStyles = styles.card;
  rounded ? cardStyles=cardStyles + ' ' + utilStyles.borderRound : cardStyles ;
  return (
    <div className={cardStyles}>
      <Image
        src={imgSrc}
        height={imgHeight}
        width={imgWidth}
        alt={imgDesc}
        className={styles.card__image}
      />
      <div className={styles.card__text}>{children}</div>
    </div>
  )
}

//Set default values for Props
MediaCard.defaultProps = {
  imgHeight: 200,
  imgWidth: 200,
  imgDesc: ``
};

//Specify the expected propTypes
MediaCard.propTypes = {
  imgSrc: PropTypes.string,               //Absolute path of the image
  imgHeight: PropTypes.number,            //Height of image in px
  imgWidth: PropTypes.number,             //Width of image in px
  imgDesc: PropTypes.string,              //Alternate text for the image
  rounded: PropTypes.bool,                //Boolean to set rounded edges
  children: PropTypes.element.isRequired  //Children must be a single element
};