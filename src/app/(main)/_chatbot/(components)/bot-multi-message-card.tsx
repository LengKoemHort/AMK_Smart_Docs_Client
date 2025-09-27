"use client";
import { ChatMessage } from "@/types/message-type";
import { Bot, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import ResponseCard from "./response-card";
import { UserRole } from "@/types/user-type";

interface BotMultiMessageCardProps {
  messages: ChatMessage[];
  userRole?: UserRole;
}

export default function BotMultiMessageCard({
  messages,
  userRole,
}: BotMultiMessageCardProps) {
  const [showAll, setShowAll] = useState(false);

  if (!messages.length) return null;

  const isSingleResponse = messages.length === 1;
  const isManyResponses = messages.length >= 5;

  const displayedMessages =
    isManyResponses && !showAll ? messages.slice(0, 4) : messages;

  const getColumnDistribution = (msgs: ChatMessage[]) => {
    const leftColumn: ChatMessage[] = [];
    const rightColumn: ChatMessage[] = [];

    msgs.forEach((msg, idx) => {
      if (idx % 2 === 0) {
        leftColumn.push(msg);
      } else {
        rightColumn.push(msg);
      }
    });

    return { leftColumn, rightColumn };
  };

  const renderSingleResponse = () => (
    <div className="w-full">
      <ResponseCard
        msg={messages[0]}
        idx={0}
        isInGrid={false}
        userRole={userRole}
      />
    </div>
  );

  const renderTwoResponses = () => (
    <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4 md:items-center">
      <ResponseCard
        msg={displayedMessages[0]}
        idx={0}
        isInGrid={true}
        userRole={userRole}
      />
      <ResponseCard
        msg={displayedMessages[1]}
        idx={1}
        isInGrid={true}
        userRole={userRole}
      />
    </div>
  );

  const renderThreeResponses = () => (
    <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4 md:items-center">
      <div className="w-full flex items-center">
        <ResponseCard
          msg={displayedMessages[0]}
          idx={0}
          isInGrid={true}
          userRole={userRole}
        />
      </div>
      <div className="flex flex-col gap-4">
        <ResponseCard
          msg={displayedMessages[1]}
          idx={1}
          isInGrid={true}
          userRole={userRole}
        />
        <ResponseCard
          msg={displayedMessages[2]}
          idx={2}
          isInGrid={true}
          userRole={userRole}
        />
      </div>
    </div>
  );

  const renderOddResponses = () => {
    const totalResponses = displayedMessages.length;
    const leftColumnCount = Math.floor(totalResponses / 2);

    const leftColumnResponses = displayedMessages.slice(0, leftColumnCount);
    const rightColumnResponses = displayedMessages.slice(leftColumnCount);

    return (
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4 md:items-center">
        <div className="flex flex-col gap-4 items-center">
          <div className="flex flex-col gap-4 w-full">
            {leftColumnResponses.map((msg, idx) => (
              <ResponseCard
                key={msg.id}
                msg={msg}
                idx={idx}
                isInGrid={true}
                userRole={userRole}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          {rightColumnResponses.map((msg, idx) => (
            <ResponseCard
              key={msg.id}
              msg={msg}
              idx={leftColumnCount + idx}
              isInGrid={true}
              userRole={userRole}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderEvenResponses = () => {
    if (displayedMessages.length === 4) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4 md:items-center">
          <div className="flex flex-col gap-4">
            <ResponseCard
              msg={displayedMessages[0]}
              idx={0}
              isInGrid={true}
              userRole={userRole}
            />
            <ResponseCard
              msg={displayedMessages[2]}
              idx={2}
              isInGrid={true}
              userRole={userRole}
            />
          </div>
          <div className="flex flex-col gap-4">
            <ResponseCard
              msg={displayedMessages[1]}
              idx={1}
              isInGrid={true}
              userRole={userRole}
            />
            <ResponseCard
              msg={displayedMessages[3]}
              idx={3}
              isInGrid={true}
              userRole={userRole}
            />
          </div>
        </div>
      );
    } else {
      const { leftColumn, rightColumn } =
        getColumnDistribution(displayedMessages);
      return (
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4 md:items-center">
          <div className="flex flex-col gap-4">
            {leftColumn.map((msg) => (
              <ResponseCard
                key={msg.id}
                msg={msg}
                idx={messages.indexOf(msg)}
                isInGrid={true}
                userRole={userRole}
              />
            ))}
          </div>
          <div className="flex flex-col gap-4">
            {rightColumn.map((msg) => (
              <ResponseCard
                key={msg.id}
                msg={msg}
                idx={messages.indexOf(msg)}
                isInGrid={true}
                userRole={userRole}
              />
            ))}
          </div>
        </div>
      );
    }
  };

  const renderResponses = () => {
    if (isSingleResponse) {
      return renderSingleResponse();
    } else if (displayedMessages.length === 2) {
      return renderTwoResponses();
    } else if (displayedMessages.length === 3) {
      return renderThreeResponses();
    } else if (displayedMessages.length % 2 === 1) {
      return renderOddResponses();
    } else {
      return renderEvenResponses();
    }
  };

  return (
    <div className="w-full mb-4">
      <div className="max-w-[90%] md:max-w-[80%] mr-auto flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-[#EDD8E2] rounded-full flex items-center justify-center shadow-sm">
            <Bot className="text-primary w-5 h-5 sm:w-7 sm:h-7" />
          </div>
          <span className="text-primary font-semibold">
            {messages.length} Response{messages.length > 1 ? "s" : ""}.
          </span>
        </div>

        {renderResponses()}

        {isManyResponses && (
          <div className="flex justify-center mt-4">
            <button
              onClick={() => setShowAll(!showAll)}
              className="flex items-center gap-2 px-4 py-2 bg-[#EDD8E2] text-[#A53C6F] rounded-lg hover:bg-[#A53C6F] hover:text-white transition-all duration-200 font-medium cursor-pointer"
            >
              {showAll ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  See More ({messages.length - 4} more)
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
