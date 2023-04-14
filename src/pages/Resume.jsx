import React from 'react'
import './resume.css'
import Linkedin from '../components/icons/Linkedin'
import Email from '../components/icons/Email'
import Github from '../components/icons/Github'
import Telephone from '../components/icons/Telephone'
import useDocumentTitle from '../assets/js/useDocumentTitle'
import Info from '../data'

const Resume = () => {
  useDocumentTitle(Info.profile.name + "'s Profile")

  return (
    <div className="container">
      <div className="top-header">
        <div className="profile-picture-container">
          <img className="profile-picture" src="me.png" alt="profile picture" />
        </div>

        <div className="profile">
          <h1>{Info.profile.name}</h1>
          <h2>{Info.profile.title}</h2>
          <p>{Info.profile.about} </p>
          <div className="hr">
            <br />
            <br />
          </div>
        </div>
      </div>
      <div className="bottom">
        <div className="left-side">
          <div className="contact">
            <h2>Contact</h2>
            <a href={'mailto:' + Info.contact.email}>
              <Email className="svg-icon" /> {Info.contact.email}
            </a>
            <a href={'tel:' + Info.contact.phone}>
              <Telephone className="svg-icon" /> {Info.contact.phone}
            </a>
            <a href={'https://github.com/' + Info.contact.github}>
              <Github className="svg-icon" /> @{Info.contact.github}
            </a>
            <a href={'https://www.linkedin.com/in/' + Info.contact.linkedin}>
              <Linkedin className="svg-icon" /> @{Info.contact.linkedin}
            </a>
          </div>

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
