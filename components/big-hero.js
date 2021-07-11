import Image from 'next/image'
import styles from './big-hero.module.scss'

export default function BigHero({ children, type, file_url="/" }) {

  let heroContent = "";
  switch(type) {
    case "image":
      heroContent = <Image
                      src={file_url}
                      layout="fill"
                      alt="algorithms on a paper"
                      objectFit="contain"
                    />
      break;
    case "pdf":
      heroContent = <iframe width="100%" height="100%"
                    src={file_url}
                    title="PDF document" frameBorder="0"
                    allowFullScreen></iframe>
      break;
    case "video":
      heroContent = <video style={{width: `inherit`, height: `inherit`, maxHeight: `100%`, maxWidth: `100%`}}
                      autoplay controls>
                      <source src={file_url} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
      break;
    case "youtube":
      heroContent = <iframe width="100%" height="100%"
                    src={file_url}
                    title="YouTube video player" frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen></iframe>
      break;
    case "rich-text":
      heroContent = <></>
      break;
    default:
      heroContent = "Error: The instructor did not set the activity type.";
  }

  return (
    <div className={styles.container}>
      { children }
      { heroContent }
    </div>
  )
}