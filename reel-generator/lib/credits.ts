
export async function spendCredit(userId: number, reason: string, tx: any) {  // 1. Check balance
  const user = await tx.user.findUnique({
    where: { id: userId },
  });

  if (!user || user.credits < 1) {
    throw new Error("Insufficient credits");
  }

  await tx.user.update({
    where: { id: userId },
    data: { credits: { decrement: 1 } },
  });

    await tx.transaction.create({
        data: {
        userId: userId,
        amount: -1,
        type: "SPEND", 
        reason: reason,
        },
    });

  return true;
}