import React from 'react'
import './resume.css'
import useDocumentTitle from '../assets/js/useDocumentTitle'
import Info from '../data'
import ProfilePicture from '../components/cards/ProfilePicture'
import Profile from '../components/cards/Profile'
import Contact from '../components/cards/Contact'

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
          <div className="education">
            <h2>Education</h2>
            {Info.education.map((edu) => (
              <div className="institute">
                <h3>{edu.institute}</h3>
                <h4>{edu.degree}</h4>
                <p>{edu.duration}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="right-side">
          <div className="skills">
            <h2>Skills</h2>
            <ul>
              {Info.skills.map((skill) => (
                <li>{skill}</li>
              ))}
            </ul>
          </div>
          <div className="projects">
            <h2>Projects</h2>
            {Info.projects.map((project) => (
              <div className="project">
                <h3>{project.name}</h3>
                <p>{project.description}</p>
                <a href={project.link}>View on GitHub</a>
              </div>
            ))}
          </div>
          <div className="experience">
            <h2>Experience</h2>
            {Info.experience.map((exp) => (
              <div className="job">
                <h3>{exp.position}</h3>
                <h4>{exp.company}</h4>
                <p>{exp.duration}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Resume
