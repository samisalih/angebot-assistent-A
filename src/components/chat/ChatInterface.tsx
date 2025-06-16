
import { ChatContainer } from "./ChatContainer";
import { Offer } from "@/types/offer";

interface ChatInterfaceProps {
  onOfferGenerated: (offer: Offer) => void;
  resetKey?: number;
}

export const ChatInterface = ({ onOfferGenerated, resetKey }: ChatInterfaceProps) => {
  return <ChatContainer onOfferGenerated={onOfferGenerated} resetKey={resetKey} />;
};
