import React from 'react'

const Projects = (Info) => {
  return (
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
  )
}

export default Projects
