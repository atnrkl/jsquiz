"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface Option {
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: number;
  question: string;
  options: Option[];
}

interface UserAnswer {
  questionId: number;
  question: string;
  selectedAnswer: string;
  isCorrect: boolean;
}

const QuizApp: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [timer, setTimer] = useState(30);
  const [isQuizStarted, setIsQuizStarted] = useState(false);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [isAnsweringEnabled, setIsAnsweringEnabled] = useState(false);

  const generateOptions = (post: any, index: number): Option[] => {
    const primaryText = post.title;
    const secondaryText = post.body;

    const optionTexts = [
      primaryText,
      secondaryText.split(" ").slice(0, 5).join(" "),
      post.title.split(" ").slice(1, 6).join(" "),
      secondaryText.split(" ").slice(5, 10).join(" "),
    ];

    const shuffledOptions = optionTexts
      .map((text, idx) => ({
        text: text,
        isCorrect: text === primaryText,
      }))
      .sort(() => Math.random() - 0.5);

    return shuffledOptions;
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(
          "https://jsonplaceholder.typicode.com/posts"
        );
        const parsedQuestions: Question[] = response.data
          .slice(0, 10)
          .map((post: any, index: number) => ({
            id: post.id,
            question: `Soru ${index + 1}: ${post.title}`,
            options: generateOptions(post, index),
          }));
        setQuestions(parsedQuestions);
      } catch (error) {
        console.error("Failed to fetch questions", error);
      }
    };

    fetchQuestions();
  }, []);

  useEffect(() => {
    if (!isQuizStarted || isQuizCompleted) return;

    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 0) {
          handleNextQuestion();
          return 30;
        }

        if (prevTimer === 20) {
          setIsAnsweringEnabled(true);
        }

        return prevTimer - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isQuizStarted, isQuizCompleted]);

  const handleStartQuiz = () => {
    setIsQuizStarted(true);
    setTimer(30);
    setIsAnsweringEnabled(false);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setTimer(30);
      setIsAnsweringEnabled(false);
    } else {
      setIsQuizCompleted(true);
    }
  };

  const handleAnswer = (selectedOption: Option) => {
    if (!isAnsweringEnabled) return;

    const currentQuestion = questions[currentQuestionIndex];
    const answerResult: UserAnswer = {
      questionId: currentQuestion.id,
      question: currentQuestion.question,
      selectedAnswer: selectedOption.text,
      isCorrect: selectedOption.isCorrect,
    };

    setUserAnswers((prev) => [...prev, answerResult]);
    handleNextQuestion();
  };

  if (!isQuizStarted) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Quiz Başlangıç</CardTitle>
        </CardHeader>
        <CardContent>
          <p>10 soruluk teste başlamak için "Başla" butonuna tıklayın.</p>
        </CardContent>
        <CardFooter>
          <Button onClick={handleStartQuiz} className="w-full">
            Başla
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (isQuizCompleted) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Test Sonuçları</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border p-2">Soru</th>
                <th className="border p-2">Verilen Yanıt</th>
                <th className="border p-2">Doğruluk</th>
              </tr>
            </thead>
            <tbody>
              {userAnswers.map((answer, index) => (
                <tr key={index}>
                  <td className="border p-2">{answer.question}</td>
                  <td className="border p-2">{answer.selectedAnswer}</td>
                  <td className="border p-2">
                    {answer.isCorrect ? "✅ Doğru" : "❌ Yanlış"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Quiz Sorusu {currentQuestionIndex + 1}</CardTitle>
      </CardHeader>
      <CardContent>
        <Progress
          value={(timer / 30) * 100}
          className="mb-4"
          color={timer <= 10 ? "red" : "blue"}
        />
        <h2 className="text-lg font-semibold mb-4">
          {currentQuestion.question}
        </h2>
        <div className="space-y-2">
          {currentQuestion.options.map((option, index) => (
            <Button
              key={index}
              onClick={() => handleAnswer(option)}
              disabled={!isAnsweringEnabled}
              variant="outline"
              className="w-full h-auto whitespace-normal break-words flex justify-start items-center"
            >
              <span className="mr-2 font-bold">
                {["A", "B", "C", "D"][index]}-)
              </span>
              <span className="text-left">{option.text}</span>
            </Button>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-gray-500">Kalan Süre: {timer} saniye</p>
      </CardFooter>
    </Card>
  );
};

export default QuizApp;
