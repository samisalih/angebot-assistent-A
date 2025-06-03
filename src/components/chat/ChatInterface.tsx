
import { ChatContainer } from "./ChatContainer";
import { Offer } from "@/types/offer";

interface ChatInterfaceProps {
  onOfferGenerated: (offer: Offer) => void;
}

export const ChatInterface = ({ onOfferGenerated }: ChatInterfaceProps) => {
  return <ChatContainer onOfferGenerated={onOfferGenerated} />;
};
