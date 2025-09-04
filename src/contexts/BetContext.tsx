import React, {createContext, useContext, useEffect, useState, ReactNode} from 'react';
import firestore from '@react-native-firebase/firestore';
import {Bet, PaymentRequest, Tab} from '../types';
import {useAuth} from './AuthContext';
import NotificationService from '../services/NotificationService';

interface BetContextType {
  bets: Bet[];
  activeBets: Bet[];
  paymentRequests: PaymentRequest[];
  tabs: Tab[];
  loading: boolean;
  createBet: (bet: Omit<Bet, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  joinBet: (betId: string, side: string) => Promise<void>;
  resolveBet: (betId: string, winningSide: string) => Promise<void>;
  agreeToBetResolution: (betId: string) => Promise<void>;
  submitEvidence: (betId: string, evidence: any) => Promise<void>;
  createPaymentRequest: (request: Omit<PaymentRequest, 'id' | 'createdAt'>) => Promise<void>;
  markPaymentCompleted: (requestId: string) => Promise<void>;
  calculateFacilitationFee: (amount: number) => number;
}

const BetContext = createContext<BetContextType | undefined>(undefined);

export const useBets = () => {
  const context = useContext(BetContext);
  if (!context) {
    throw new Error('useBets must be used within a BetProvider');
  }
  return context;
};

interface BetProviderProps {
  children: ReactNode;
}

export const BetProvider: React.FC<BetProviderProps> = ({children}) => {
  const {user} = useAuth();
  const [bets, setBets] = useState<Bet[]>([]);
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [loading, setLoading] = useState(true);

  const activeBets = bets.filter(bet => 
    ['pending', 'active', 'awaiting_resolution'].includes(bet.status)
  );

  // Helper function to handle bet resolution payment logic
  const handleBetResolution = async (betData: Bet, winningSide: string, betId: string) => {
    // Notify all participants about resolution
    const participantIds = betData.participants.map(p => p.userId);
    NotificationService.notifyBetResolved(
      participantIds,
      betData.title,
      winningSide,
      betId
    );

    // Create payment requests for losers
    const losers = betData.participants.filter(p => p.side !== winningSide);
    const winners = betData.participants.filter(p => p.side === winningSide);
    
    if (losers.length > 0 && winners.length > 0) {
      // For simplicity, losers pay the first winner
      const winner = winners[0];
      
      for (const loser of losers) {
        const paymentRequest = {
          fromUserId: loser.userId,
          toUserId: winner.userId,
          amount: betData.amount,
          description: `Payment for bet: ${betData.title}`,
          betId,
          status: 'pending' as const,
          createdAt: new Date(),
        };
        
        await firestore().collection('paymentRequests').add(paymentRequest);
        
        // Notify loser about payment requirement
        NotificationService.notifyPaymentRequired(
          loser.userId,
          betData.amount,
          betData.title,
          betId
        );
      }
    }
  };

  useEffect(() => {
    if (!user) {
      setBets([]);
      setPaymentRequests([]);
      setTabs([]);
      setLoading(false);
      return;
    }

    // Subscribe to user's bets
    const unsubscribeBets = firestore()
      .collection('bets')
      .where('participants', 'array-contains-any', [user.id])
      .onSnapshot(snapshot => {
        const userBets = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
          resolutionDeadline: doc.data().resolutionDeadline?.toDate(),
          resolvedAt: doc.data().resolvedAt?.toDate(),
        })) as Bet[];
        setBets(userBets);
        setLoading(false);
      });

    // Subscribe to payment requests
    const unsubscribePayments = firestore()
      .collection('paymentRequests')
      .where('toUserId', '==', user.id)
      .onSnapshot(snapshot => {
        const requests = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          completedAt: doc.data().completedAt?.toDate(),
        })) as PaymentRequest[];
        setPaymentRequests(requests);
      });

    // Subscribe to tabs (if premium user)
    let unsubscribeTabs: (() => void) | undefined;
    if (user.isPremium) {
      unsubscribeTabs = firestore()
        .collection('tabs')
        .where('participants', 'array-contains', user.id)
        .onSnapshot(snapshot => {
          const userTabs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate() || new Date(),
          })) as Tab[];
          setTabs(userTabs);
        });
    }

    return () => {
      unsubscribeBets();
      unsubscribePayments();
      unsubscribeTabs?.();
    };
  }, [user]);

  const createBet = async (betData: Omit<Bet, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    if (!user) throw new Error('User not authenticated');

    const facilitationFee = calculateFacilitationFee(betData.amount);
    
    const bet = {
      ...betData,
      facilitationFee,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await firestore().collection('bets').add(bet);
    
    // Notify neutral party if assigned
    if (bet.neutralParty && bet.resolutionType === 'neutral_party') {
      NotificationService.notifyNeutralPartyAssigned(
        bet.neutralParty,
        bet.title,
        docRef.id
      );
    }
    
    return docRef.id;
  };

  const joinBet = async (betId: string, side: string) => {
    if (!user) throw new Error('User not authenticated');

    const betRef = firestore().collection('bets').doc(betId);
    const bet = await betRef.get();
    const betData = bet.data() as Bet;

    const updatedBet = {
      participants: firestore.FieldValue.arrayUnion({
        userId: user.id,
        displayName: user.displayName,
        photoURL: user.photoURL,
        side,
      }),
      status: 'active', // Bet becomes active when someone joins
      updatedAt: new Date(),
    };

    await betRef.update(updatedBet);

    // Check if bet should move to awaiting resolution (if it has enough participants)
    const updatedParticipants = [...betData.participants, {
      userId: user.id,
      displayName: user.displayName,
      photoURL: user.photoURL,
      side,
    }];

    // If bet has participants on different sides, it can be resolved
    const uniqueSides = new Set(updatedParticipants.map(p => p.side));
    if (uniqueSides.size >= 2) {
      await betRef.update({
        status: 'awaiting_resolution',
        updatedAt: new Date(),
      });

      // Notify neutral party if assigned
      if (betData.neutralParty && betData.resolutionType === 'neutral_party') {
        NotificationService.notifyBetReadyForResolution(
          betData.neutralParty,
          betData.title,
          betId
        );
      }
    }

    // Notify other participants
    const otherParticipants = betData.participants
      .filter(p => p.userId !== user.id)
      .map(p => p.userId);
    
    if (otherParticipants.length > 0) {
      NotificationService.notifyBetJoined(
        otherParticipants,
        user.displayName,
        betData.title,
        betId
      );
    }
  };

  const resolveBet = async (betId: string, winningSide: string) => {
    if (!user) throw new Error('User not authenticated');

    const betRef = firestore().collection('bets').doc(betId);
    const bet = await betRef.get();
    const betData = bet.data() as Bet;

    await betRef.update({
      status: 'resolved',
      winner: winningSide,
      resolvedAt: new Date(),
      resolvedBy: user.id,
      updatedAt: new Date(),
    });

    // Notify all participants about resolution
    const participantIds = betData.participants.map(p => p.userId);
    NotificationService.notifyBetResolved(
      participantIds,
      betData.title,
      winningSide,
      betId
    );

    // Create payment requests for losers
    const losers = betData.participants.filter(p => p.side !== winningSide);
    const winners = betData.participants.filter(p => p.side === winningSide);
    
    if (losers.length > 0 && winners.length > 0) {
      // For simplicity, losers pay the first winner
      const winner = winners[0];
      
      for (const loser of losers) {
        const paymentRequest = {
          fromUserId: loser.userId,
          toUserId: winner.userId,
          amount: betData.amount,
          description: `Payment for bet: ${betData.title}`,
          betId,
          status: 'pending' as const,
          createdAt: new Date(),
        };
        
        await firestore().collection('paymentRequests').add(paymentRequest);
        
        // Notify loser about payment requirement
        NotificationService.notifyPaymentRequired(
          loser.userId,
          betData.amount,
          betData.title,
          betId // Using betId as payment reference for demo
        );
      }
    }
  };

  const agreeToBetResolution = async (betId: string, winningSide?: string) => {
    if (!user) throw new Error('User not authenticated');

    const betRef = firestore().collection('bets').doc(betId);
    const bet = await betRef.get();
    const betData = bet.data() as Bet;

    const updatedParticipants = betData.participants.map(p => 
      p.userId === user.id ? {...p, hasAgreed: true} : p
    );

    const allAgreed = updatedParticipants.every(p => p.hasAgreed);

    if (allAgreed && winningSide) {
      // Everyone has agreed and we have a winning side - resolve the bet
      await betRef.update({
        participants: updatedParticipants,
        status: 'resolved',
        winner: winningSide,
        resolvedAt: new Date(),
        resolvedBy: 'consensus',
        updatedAt: new Date(),
      });

      // Create payment requests and notify participants
      await handleBetResolution(betData, winningSide, betId);
    } else {
      // Update agreement status
      await betRef.update({
        participants: updatedParticipants,
        status: allAgreed ? 'awaiting_resolution' : betData.status,
        updatedAt: new Date(),
      });

      // Notify remaining participants if not everyone has agreed yet
      if (!allAgreed) {
        const remainingParticipants = updatedParticipants
          .filter(p => !p.hasAgreed)
          .map(p => p.userId);
        
        // In a real app, you'd send notifications to remaining participants
        console.log('Notify remaining participants:', remainingParticipants);
      }
    }
  };

  const submitEvidence = async (betId: string, evidence: any) => {
    if (!user) throw new Error('User not authenticated');

    await firestore()
      .collection('bets')
      .doc(betId)
      .update({
        evidence: firestore.FieldValue.arrayUnion({
          ...evidence,
          submittedBy: user.id,
          submittedAt: new Date(),
        }),
        updatedAt: new Date(),
      });
  };

  const createPaymentRequest = async (request: Omit<PaymentRequest, 'id' | 'createdAt'>) => {
    await firestore().collection('paymentRequests').add({
      ...request,
      createdAt: new Date(),
    });
  };

  const markPaymentCompleted = async (requestId: string) => {
    await firestore()
      .collection('paymentRequests')
      .doc(requestId)
      .update({
        status: 'completed',
        completedAt: new Date(),
      });
  };

  const calculateFacilitationFee = (amount: number): number => {
    if (amount < 20) return 0;
    
    // Tiered fee structure
    if (amount < 100) return 1; // $1 for bets $20-$99
    if (amount < 500) return Math.ceil(amount * 0.02); // 2% for $100-$499
    if (amount < 1000) return Math.ceil(amount * 0.015); // 1.5% for $500-$999
    return Math.ceil(amount * 0.01); // 1% for $1000+
  };

  const value: BetContextType = {
    bets,
    activeBets,
    paymentRequests,
    tabs,
    loading,
    createBet,
    joinBet,
    resolveBet,
    agreeToBetResolution,
    submitEvidence,
    createPaymentRequest,
    markPaymentCompleted,
    calculateFacilitationFee,
  };

  return (
    <BetContext.Provider value={value}>
      {children}
    </BetContext.Provider>
  );
};
