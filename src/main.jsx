import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Shuffle, Users, Trash2, Copy, RotateCcw, Plus, AlertCircle } from 'lucide-react';
import './style.css';

function App() {
  const [rawNames, setRawNames] = useState('홍길동\n김철수\n이영희'); // 초기값
  const [assignments, setAssignments] = useState([]);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const people = useMemo(() => {
    const names = rawNames
      .split(/\n|,/)
      .map((name) => name.trim())
      .filter(Boolean);

    return [...new Set(names)];
  }, [rawNames]);

  const duplicateCount = useMemo(() => {
    const names = rawNames
      .split(/\n|,/)
      .map((name) => name.trim())
      .filter(Boolean);

    return names.length - new Set(names).size;
  }, [rawNames]);

  function shuffleArray(array) {
    const copied = [...array];
    for (let i = copied.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copied[i], copied[j]] = [copied[j], copied[i]];
    }
    return copied;
  }

  // 채점 배정 로직
  function generateAssignments() {
    setCopied(false);
    setError('');

    if (people.length < 4) {
      setAssignments([]);
      setError('각 사람에게 본인을 제외한 평가자 3명을 배정하려면 최소 4명이 필요합니다.');
      return;
    }

    const result = people.map((person) => {
      const candidates = people.filter((candidate) => candidate !== person); // 평가 대상자 제외 배정
      const evaluators = shuffleArray(candidates).slice(0, 3); // 무작위 3명
      return { person, evaluators };
    });

    setAssignments(result);
  }

  function clearAll() {
    setRawNames('');
    setAssignments([]);
    setError('');
    setCopied(false);
  }

  async function copyResult() {
    if (!assignments.length) return;

    const text = assignments
      .map((item) => `${item.person}: ${item.evaluators.join(', ')}`)
      .join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError('복사에 실패했습니다. 브라우저 권한을 확인해주세요.');
    }
  }

  function addExampleNames() {
    const examples = ['김민수', '이서연', '박지훈', '최유진', '정하늘', '문지원'];
    setRawNames(examples.join('\n'));
    setAssignments([]);
    setError('');
    setCopied(false);
  }

  return (
    <div className="app">
      <main className="container">
        <section className="hero">
          <div className="heroText">
            <div className="badge">
              <Users size={16} /> 랜덤 평가자 배정기
            </div>
            <h1>사람별 평가자 3명 자동 배정</h1>
            <p>
              사람 이름을 한 줄에 한 명씩 입력하면, 각 사람마다 본인을 제외한 입력자 중
              3명을 임의로 평가자로 배정합니다.
            </p>
          </div>

          <div className="heroActions">
            <button className="primaryButton" onClick={generateAssignments}>
              <Shuffle size={18} /> 배정하기
            </button>
            <button className="secondaryButton" onClick={clearAll}>
              <Trash2 size={18} /> 초기화
            </button>
          </div>
        </section>

        <section className="grid">
          <article className="card">
            <div className="cardHeader">
              <div>
                <h2>사람 입력</h2>
                <p>줄바꿈 또는 쉼표로 구분할 수 있습니다.</p>
              </div>
              <button className="ghostButton" onClick={addExampleNames}>
                <Plus size={17} /> 예시
              </button>
            </div>

            <textarea
              value={rawNames}
              onChange={(event) => {
                setRawNames(event.target.value);
                setAssignments([]);
                setError('');
                setCopied(false);
              }}
              placeholder={'예시)\n김민수\n이서연\n박지훈\n최유진'}
            />

            <div className="stats">
              <div className="statBox">
                <span>인식된 사람 수</span>
                <strong>{people.length}</strong>
              </div>
              <div className="statBox warning">
                <span>중복 제거 수</span>
                <strong>{duplicateCount}</strong>
              </div>
            </div>

            {error && (
              <div className="errorBox">
                <AlertCircle size={18} /> {error}
              </div>
            )}
          </article>

          <article className="card">
            <div className="cardHeader resultHeader">
              <div>
                <h2>배정 결과</h2>
                <p>배정하기를 다시 누르면 새로운 조합으로 바뀝니다.</p>
              </div>
              <div className="resultActions">
                <button className="secondaryButton small" onClick={generateAssignments}>
                  <RotateCcw size={17} /> 재배정
                </button>
                <button className="copyButton" onClick={copyResult} disabled={!assignments.length}>
                  <Copy size={17} /> {copied ? '복사됨' : '복사'}
                </button>
              </div>
            </div>

            {!assignments.length ? (
              <div className="emptyState">
                <div className="emptyIcon">
                  <Shuffle size={38} />
                </div>
                <strong>아직 배정 결과가 없습니다.</strong>
                <p>왼쪽에 사람을 4명 이상 입력한 뒤 배정하기 버튼을 눌러주세요.</p>
              </div>
            ) : (
              <div className="assignmentList">
                {assignments.map((item, index) => (
                  <div className="assignmentItem" key={`${item.person}-${index}`}>
                    <div className="target">
                      <div className="number">{index + 1}</div>
                      <div>
                        <span>평가 대상</span>
                        <strong>{item.person}</strong>
                      </div>
                    </div>
                    <div className="evaluators">
                      {item.evaluators.map((evaluator) => (
                        <span key={`${item.person}-${evaluator}`}>{evaluator}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </article>
        </section>
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
