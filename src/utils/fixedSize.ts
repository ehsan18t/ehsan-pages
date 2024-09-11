const mdBreakpoint = 768;

function setFixedSize(id: string) {
  // Find the section element and cast it to HTMLElement
  const section = document.getElementById(id) as HTMLElement;

  // Check if the current device width is smaller than `md`
  if (window.innerWidth < mdBreakpoint) {
    // Create a temporary element to measure 100dvh
    const tempDiv = document.createElement("div");
    tempDiv.style.height = "100dvh"; // Set the height to 100dvh
    tempDiv.style.position = "absolute"; // Prevent it from affecting layout
    tempDiv.style.visibility = "hidden"; // Hide it visually
    document.body.appendChild(tempDiv); // Append it to the body to measure

    // Get the computed height in pixels
    const initialHeight = tempDiv.offsetHeight;

    section.style.height = `${initialHeight}px`;

    // Clean up the temporary element
    document.body.removeChild(tempDiv);
  } else {
    section.classList.add("h-screen");
  }
}
