import React from 'react'
import Layout from './PartyPlaylist/Layout'

const PrivacyPolicy = () => {
  return (
    <Layout enableBack>
      <section style={{ maxWidth: '900px', padding: '0 16px' }}>
        <h1>Privacy Policy</h1>
        <p>
          Party Blends complies with{' '}
          <i>
            <a
              className="spotify-link"
              target="_blank"
              href="https://developer.spotify.com/terms/"
            >
              Spotify's 3rd party app privacy agreement 2021.
            </a>
          </i>
        </p>
        <p>
          This means we wont use your data for any other purpose than to run
          this application. As such, we delete your data if you leave the
          application. Additionally we only ask to store the minimum data
          required to run this application.
        </p>
        <p></p>
      </section>
    </Layout>
  )
}

export default PrivacyPolicy
