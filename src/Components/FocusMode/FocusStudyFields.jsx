export default function FocusStudyFields({ curriculum, groupName, subject, onSubject, chapters, onChapters }) {
  const { subjects, loading, error, retry } = curriculum;
  const selected = subjects.find((item) => item.name === subject);
  const availableChapters = selected?.chapters || [];
  const selectedCount = availableChapters.filter((chapter) => chapters.includes(chapter.name)).length;

  return (
    <>
      <p className="focus-group-note">Subjects for <strong>{groupName}</strong></p>
      <label htmlFor="focus-subject">What are you studying?</label>
      <select
        id="focus-subject"
        value={selected ? subject : ""}
        disabled={loading || !!error}
        onChange={(event) => { onSubject(event.target.value); onChapters([]); }}
        required
      >
        <option value="">{loading ? "Loading your subjects…" : "Choose a subject"}</option>
        {subjects.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
      </select>
      {error && <div className="focus-curriculum-error" role="alert"><p>Could not load your subjects. {error}</p><button className="focus-secondary" type="button" onClick={retry}>Try again</button></div>}
      {!loading && !error && !subjects.length && <p className="focus-field-help" role="status">No subjects are available for your group yet.</p>}
      <fieldset className="focus-chapter-field" disabled={!selected || loading || !!error}>
        <legend>Chapters to study</legend>
        <p id="focus-chapters-help" className="focus-field-help">{selected ? "Choose one or more chapters for this session." : "Choose a subject to see its chapters."}</p>
        {availableChapters.length > 0 && <>
          <div className="focus-chapter-toolbar"><span>{selectedCount} of {availableChapters.length} selected</span><button type="button" onClick={() => onChapters(selectedCount === availableChapters.length ? [] : availableChapters.map((chapter) => chapter.name))}>{selectedCount === availableChapters.length ? "Clear all" : "Select all"}</button></div>
          <div className="focus-chapter-options" role="group" aria-label="Available chapters" aria-describedby="focus-chapters-help">
            {availableChapters.map((chapter) => <label key={chapter.name} className={`focus-chapter-option${chapters.includes(chapter.name) ? " is-selected" : ""}`}>
              <input type="checkbox" checked={chapters.includes(chapter.name)} onChange={(event) => onChapters(event.target.checked ? [...chapters, chapter.name] : chapters.filter((name) => name !== chapter.name))} />
              <span>{chapter.name}</span>
            </label>)}
          </div>
        </>}
        {selected && !availableChapters.length && <p className="focus-field-help">No chapters are available for this subject yet.</p>}
      </fieldset>
    </>
  );
}
