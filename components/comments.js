import Link from 'next/link'
import Image from 'next/image'
import styles from './comments.module.scss'

// Add upvote and down vote functionality
function Comment({image, name, content, can_reply}) {
  return (
    <div className={styles.comment}>
      <div className={styles.comment__left}>
        <span className={styles.upArrow}></span>
        <div className={styles.commentImage}>
          <Image
            src={image}
            layout="fill"
            alt="algorithms on a paper"
            objectFit="cover"
          />
        </div>
        <span className={styles.downArrow}></span>
      </div>
      <div className={styles.comment__main}>
        <p>
          <b>{ name }</b><br />
          {content}<br />
          {can_reply ? <small>Reply</small> : ''}
        </p>
      </div>
    </div>
  )
}

function CommentInput({ image }) {
  return (
  <div className={styles.comment}>
    <div className={styles.comment__left}>
      <div className={styles.commentImage}>
        <Image
          src={image}
          layout="fill"
          alt="algorithms on a paper"
          objectFit="cover"
        />
      </div>
    </div>
    <div className={styles.comment__main}>
      <input type="text" placeholder="Comment" className={styles.commentsInput__text} />
      <button className={styles.commentsInput__button}>Comment</button>
    </div>
  </div>
  )
}

export default function Comments({ user, comments }) {
  return (
    <div className={styles.container}>
      <CommentInput image={user.image} />
      {
        comments.map(
          ({
            image='https://greened-users.nyc3.digitaloceanspaces.com/user.png',
            creator_name,
            post_content,
            can_reply
          }) => (
          <Comment image={image} name={creator_name} content={post_content} can_reply={can_reply} />
        ))
      }
    </div>
  )
}

Comments.defaultProps = {
  comments: []
};

CommentInput.defaultProps = {
  image: '/images/math.jpg'
};

Comment.defaultProps = {
  image: '/images/math.jpg'
};