import React from 'react';

interface JobDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function JobDescriptionInput({ value, onChange }: JobDescriptionInputProps) {
  return (
    <section>
      <h3 className="col-header mb-4">Job Description</h3>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste the job description here..."
        className="w-full h-64 p-4 bg-white border border-line/20 text-sm focus:outline-none focus:border-ink transition-colors resize-none font-sans leading-relaxed"
      />
    </section>
  );
}
