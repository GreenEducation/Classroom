import Head from 'next/head'
import Layout, { siteTitle } from '../components/layout'
import Card from '../components/card'
import Table from '../components/table'
import styles from './submission.module.scss'

export default function Submission() {

  return (
    <Layout>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <div className={styles.container}>
        <div className={styles.head}>
          <h6>Submissions {`>`} Math 138</h6>
          <span>
            <label className={styles.dropdownLabel} for="sort">Sort</label>
            <select className={styles.dropdown} name="sort" id="sort">
              <option value="default">Default</option>
              <option value="task-type">Task Type</option>
              <option value="module">Module</option>
              <option value="due-date">Due Date</option>
            </select>
          </span>
        </div>
        <Card className={styles.card}>
          <Table>
            <thead>
              <tr>
                <th>Task</th>
                <th>Module</th>
                <th>Due Date</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Assignment 1</td>
                <td>Week 1</td>
                <td>09 June 2021</td>
                <td>70%</td>
              </tr>
              <tr>
                <td>Assignment 2</td>
                <td>Week 2</td>
                <td>16 June 2021</td>
                <td>89%</td>
              </tr>
              <tr>
                <td>Assignment 3</td>
                <td>Week 3</td>
                <td>23 June 2021</td>
                <td>76%</td>
              </tr>
            </tbody>
          </Table>
        </Card>
      </div>
    </Layout>
  )
}
