import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Zap, 
  ArrowRight, 
  RotateCcw,
  Trophy,
  Video,
  ShieldCheck,
  Building2,
  X
} from 'lucide-react';
import { DailyTask } from '../types';

interface SponsoredQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: DailyTask;
  rewardAmount: number;
  onCompleteQuiz: (score: number, passed: boolean) => void;
  onWatchRewardedAd: () => void;
  hasWatchedAd?: boolean;
}

export const SponsoredQuizModal: React.FC<SponsoredQuizModalProps> = ({
  isOpen,
  onClose,
  task,
  rewardAmount,
  onCompleteQuiz,
  onWatchRewardedAd,
  hasWatchedAd = false
}) => {
  const questions = task.detailsContent?.quizQuestions || [];
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [isQuizCompleted, setIsQuizCompleted] = useState<boolean>(false);

  if (!isOpen || questions.length === 0) return null;

  const currentQ = questions[currentQuestionIndex];
  const isCorrect = selectedOption === currentQ.correctAnswerIndex;

  const handleSelectOption = (index: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(index);
  };

  const handleCheckAnswer = () => {
    if (selectedOption === null) return;
    setIsAnswerSubmitted(true);
  };

  const handleNextQuestion = () => {
    const updatedAnswers = [...userAnswers, selectedOption!];
    setUserAnswers(updatedAnswers);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);

    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Calculate score
      let correctCount = 0;
      questions.forEach((q, idx) => {
        if (updatedAnswers[idx] === q.correctAnswerIndex) {
          correctCount++;
        }
      });
      setIsQuizCompleted(true);
      onCompleteQuiz(correctCount, correctCount >= 2);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setUserAnswers([]);
    setIsQuizCompleted(false);
  };

  const correctScore = userAnswers.reduce((acc, ans, idx) => {
    return ans === questions[idx]?.correctAnswerIndex ? acc + 1 : acc;
  }, 0);

  const effectiveReward = hasWatchedAd ? rewardAmount * 2 : rewardAmount;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header with Sponsor Badge */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-bold shadow-md">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded tracking-wider uppercase">
                  {task.sponsorBadge || 'SPONSORED QUIZ'}
                </span>
                <span className="text-xs text-amber-300 font-bold">{task.sponsorName || 'Treasure Homes Advisory'}</span>
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-white">Daily Real Estate Intelligence Challenge</h3>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-grow">
          {!isQuizCompleted ? (
            <>
              {/* Question Progress Tracker */}
              <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                <span>QUESTION {currentQuestionIndex + 1} OF {questions.length}</span>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="font-bold text-slate-900">₦{effectiveReward.toLocaleString()} Potential Yield</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-amber-500 h-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex) / questions.length) * 100}%` }}
                />
              </div>

              {/* Question Headline */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  {currentQ.question}
                </h4>
              </div>

              {/* Options list */}
              <div className="space-y-3">
                {currentQ.options.map((opt, idx) => {
                  const isSelected = selectedOption === idx;
                  const isThisCorrect = idx === currentQ.correctAnswerIndex;

                  let buttonStyle = "border-slate-200 hover:border-amber-400 hover:bg-amber-50/40 text-slate-800";
                  if (isSelected && !isAnswerSubmitted) {
                    buttonStyle = "border-amber-500 bg-amber-50 text-slate-950 font-bold ring-2 ring-amber-500/20";
                  } else if (isAnswerSubmitted) {
                    if (isThisCorrect) {
                      buttonStyle = "border-emerald-500 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500/20";
                    } else if (isSelected && !isThisCorrect) {
                      buttonStyle = "border-rose-400 bg-rose-50 text-rose-950";
                    } else {
                      buttonStyle = "border-slate-200 text-slate-400 opacity-60";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={isAnswerSubmitted}
                      className={`w-full text-left p-4 rounded-xl border transition-all text-xs sm:text-sm flex items-center justify-between cursor-pointer ${buttonStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center font-mono text-xs font-bold shrink-0">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{opt}</span>
                      </div>
                      {isAnswerSubmitted && isThisCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      )}
                      {isAnswerSubmitted && isSelected && !isThisCorrect && (
                        <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation note when answered */}
              {isAnswerSubmitted && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl border text-xs leading-relaxed ${
                    isCorrect ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' : 'bg-amber-50/80 border-amber-200 text-amber-900'
                  }`}
                >
                  <p className="font-bold mb-1 flex items-center gap-1.5">
                    {isCorrect ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Sparkles className="w-4 h-4 text-amber-600" />}
                    <span>{isCorrect ? 'Accurate Answer!' : 'Key Takeaway:'}</span>
                  </p>
                  <p>{currentQ.explanation}</p>
                </motion.div>
              )}
            </>
          ) : (
            /* QUIZ RESULTS & REWARD SECTION */
            <div className="text-center py-6 space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center mx-auto shadow-xl text-slate-950">
                <Trophy className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-2xl font-black text-slate-900 uppercase">Challenge Complete!</h3>
                <p className="text-xs text-slate-500 mt-1">
                  You scored <strong className="text-slate-900 font-mono text-sm">{correctScore} / {questions.length}</strong> on today's sponsored assessment.
                </p>
              </div>

              {/* Payout box */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 max-w-sm mx-auto space-y-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Credited Task Yield</span>
                <div className="text-3xl font-black text-amber-600 font-mono">
                  ₦{effectiveReward.toLocaleString()}
                </div>
                {hasWatchedAd ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
                    <Zap className="w-3.5 h-3.5 fill-emerald-500" /> 2X Rewarded Ad Boost Applied!
                  </span>
                ) : (
                  <button
                    onClick={onWatchRewardedAd}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-purple-500/20 cursor-pointer transition-all hover:scale-[1.02]"
                  >
                    <Video className="w-4 h-4 text-amber-300" />
                    <span>Watch 12s Ad to Double to ₦{(rewardAmount * 2).toLocaleString()}</span>
                  </button>
                )}
              </div>

              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                Sponsored trivia and video boosts are 100% funded by corporate advertisers, providing zero capital deductions from your account.
              </p>
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between gap-3">
          {!isQuizCompleted ? (
            <>
              <button
                onClick={onClose}
                className="text-xs text-slate-500 hover:text-slate-900 font-semibold px-3 py-2"
              >
                Exit Quiz
              </button>

              {!isAnswerSubmitted ? (
                <button
                  onClick={handleCheckAnswer}
                  disabled={selectedOption === null}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                    selectedOption !== null
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 cursor-pointer'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <span>Verify Answer</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-2 shadow-md cursor-pointer transition-all"
                >
                  <span>{currentQuestionIndex + 1 < questions.length ? 'Next Question' : 'View Results & Claim'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
            >
              Done & Return to Daily Hub
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
