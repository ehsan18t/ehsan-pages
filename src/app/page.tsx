'use client';

import { useState } from 'react';
import { Hero, Skills, Experiences } from '@/components';
import ReactPageScroller from '@campusrush/react-page-scroller';

export default function Home() {
  const [currentPage, setCurrentPage] = useState(0);

  const handlePageChange = (number: number) => {
    setCurrentPage(number);
  };

  return (
    <main>
      <ReactPageScroller pageOnChange={handlePageChange} customPageNumber={currentPage}>
        <Hero />
        <Skills />
        <Experiences />
      </ReactPageScroller>
    </main>
  );
}
