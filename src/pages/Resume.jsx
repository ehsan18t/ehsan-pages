import React from 'react'
import './resume.css'
import useDocumentTitle from '../assets/js/useDocumentTitle'
import Info from '../data'
import ProfilePicture from '../components/cards/ProfilePicture'
import Profile from '../components/cards/Profile'
import Contact from '../components/cards/Contact'
import Education from '../components/cards/Education'
import Skills from '../components/cards/Skills'
import Projects from '../components/cards/Projects'
import Experience from '../components/cards/Experience'

const Resume = () => {
  useDocumentTitle(Info.profile.name + "'s Profile")

  return (
    <div className="container">
      <div className="top-header">
        <ProfilePicture picture={Info.profile.picture} />
        <Profile info={Info.profile} />
      </div>
      <div className="bottom">
        <div className="left-side">
          <Contact contact={Info.contact} />
          <Education education={Info.education} />
        </div>
        <div className="right-side">
          <Skills skills={Info.skills} />
          <Projects projects={Info.projects} />
          <Experience experience={Info.experience} />
        </div>
      </div>
    </div>
  )
}

export default Resume
