import { Request, Response } from 'express';
import { db } from '@/lib/db';
import { ads, drafts, tempImages, wallets, transactions as walletTransactions, adPromotions, pricing, sales, chats, messages } from '@/lib/db/schema';
import { inArray, eq, and, sql, count } from 'drizzle-orm';
import { cityCoords } from '@/lib/cityCoords';
import { fetchAdsServer } from '@/lib/fetch-ads';

// GET /ads/draft — dohvatanje radne verzije prijavljenog korisnika
export async function getDraft(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { id, all } = req.query;

    if (all === 'true') {
      const allDrafts = await db.query.drafts.findMany({
        where: eq(drafts.userId, userId),
        orderBy: [sql`${drafts.createdAt} DESC`]
      });
      return res.json({ success: true, drafts: allDrafts });
    }

    const draftId = id ? parseInt(id as string) : null;
    const condition = draftId 
      ? and(eq(drafts.userId, userId), eq(drafts.id, draftId))
      : eq(drafts.userId, userId);

    const draft = await db.query.drafts.findFirst({
      where: condition,
      orderBy: [sql`${drafts.createdAt} DESC`]
    });
    return res.json({ success: true, draft: draft || null });
  } catch (err: any) {
    console.error('Error fetching draft:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// POST /ads/draft — kreiranje ili ažuriranje radne verzije
export async function saveDraft(req: Request, res: Response) {
  try {
    const userId = req.user!.id;

    const {
      id: reqDraftId,
      title, description, price, currency, condition, category, country, city, address, street, phone, images, attributes, isPriceOnRequest, isContact, showAddress, showPhone
    } = req.body;

    let draft = null;
    const parsedDraftId = reqDraftId ? parseInt(reqDraftId.toString()) : null;

    if (parsedDraftId) {
      draft = await db.query.drafts.findFirst({
        where: and(eq(drafts.userId, userId), eq(drafts.id, parsedDraftId))
      });
    }

    const parsedPrice = price !== null && price !== undefined && price !== "" ? parseFloat(price.toString()) : null;

    const finalAttributes = { ...(attributes || {}) };
    if (condition !== undefined) {
      finalAttributes.condition = condition || null;
    }

    const values = {
      title: title !== undefined ? title : null,
      description: description !== undefined ? description : null,
      price: parsedPrice,
      currency: currency || 'EUR',
      isPriceOnRequest: isPriceOnRequest ?? isContact ?? false,
      showAddress: showAddress !== undefined ? !!showAddress : true,
      showPhone: showPhone !== undefined ? !!showPhone : true,
      category: category !== undefined ? category : null,
      country: country || 'Srbija',
      city: city !== undefined ? city : null,
      address: address || street || null,
      phone: phone !== undefined ? phone : null,
      images: images || [],
      attributes: finalAttributes,
      userId,
      updatedAt: new Date()
    };

    if (draft) {
      const [updated] = await db.update(drafts)
        .set(values)
        .where(eq(drafts.id, draft.id))
        .returning();
      return res.json({ success: true, draft: updated });
    } else {
      const [inserted] = await db.insert(drafts)
        .values({
          ...values,
          createdAt: new Date()
        })
        .returning();
      return res.json({ success: true, draft: inserted });
    }
  } catch (err: any) {
    console.error('Error saving draft:', err);
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
}

// DELETE /ads/draft — brisanje radne verzije
export async function deleteDraft(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { id } = req.query;
    const draftId = id ? parseInt(id as string) : null;

    if (draftId) {
      await db.delete(drafts).where(and(eq(drafts.userId, userId), eq(drafts.id, draftId)));
    } else {
      await db.delete(drafts).where(eq(drafts.userId, userId));
    }
    return res.json({ success: true });
  } catch (err: any) {
    console.error('Error deleting draft:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /ads — lista oglasa sa filterima
export async function getAds(req: Request, res: Response) {
  try {
    const params: any = req.query;
    if (req.user) {
      params.currentUserId = req.user.id;
    }
    const { ads: adsList, total } = await fetchAdsServer(params);
    return res.json({ success: true, ads: adsList, total });
  } catch (err: any) {
    console.error('Error fetching ads in API:', err.message);
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
}

// POST /ads — kreiranje novog oglasa
export async function createAd(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const {
      draftId, title, description, price, currency, condition, category, country, city, address, street, contactPhone, images, imageTempIds, isPriceOnRequest, isContact, attributes,
      visibilityDuration, selectedPromotions, showAddress, showPhone
    } = req.body;

    if (!title || !category || !city || !country) {
      return res.status(400).json({ error: 'Nedostaju obavezna polja.' });
    }

    let lat: number | undefined;
    let lng: number | undefined;

    const finalAddress = address || street || null;

    if (finalAddress && city) {
      try {
        const query = `${finalAddress}, ${city}, Serbia`;
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`, { headers: { 'User-Agent': 'Galset-App/1.0' } });
        const geoData = (await geoRes.json()) as any;
        if (geoData && geoData.length > 0) { lat = parseFloat(geoData[0].lat); lng = parseFloat(geoData[0].lon); }
      } catch (geoErr) { console.error('Geocoding error:', geoErr); }
    }

    if (lat === undefined || lng === undefined) {
      const cityData = (cityCoords as any)[city];
      if (cityData) { lat = cityData.lat; lng = cityData.lng; }
    }

    // Wallet & Pricing Check
    const userWallet = await db.query.wallets.findFirst({ where: eq(wallets.userId, userId) });
    if (!userWallet) {
      return res.status(404).json({ error: 'Novčanik nije pronađen.' });
    }

    const pricingList = await db.select().from(pricing);
    const getVisibilityPrice = (days: number) => {
      const item = pricingList.find(p => p.category === 'promocija' && (p.features as any)?.durationDays === days && p.name.includes("Objava oglasa"));
      return item ? item.price : 0;
    };
    const getPromoPrice = (type: string, days: number) => {
      if (type === 'HITNO') {
        const item = pricingList.find(p => p.category === 'promocija' && p.name.includes("Hitno"));
        return item ? item.price : 200;
      }
      const item = pricingList.find(p => p.category === 'promocija' && (p.features as any)?.durationDays === days && (p.features as any)?.type === type);
      return item ? item.price : 0;
    };
    const getExtraImagePrice = () => {
      const item = pricingList.find(p => p.category === 'promocija' && p.name === "Dodatno postavljanje slika");
      return item ? item.price : 10;
    };

    const duration = visibilityDuration ? parseInt(visibilityDuration.toString()) : 30;
    const visibilityPrice = getVisibilityPrice(duration);

    let promotionsCost = 0;
    const promotionsToCreate: { type: any, expiresAt: Date, duration: number }[] = [];

    const hasHitno = selectedPromotions && Array.isArray(selectedPromotions) && selectedPromotions.some(p => p.type === 'HITNO');

    if (selectedPromotions && Array.isArray(selectedPromotions)) {
      for (const promo of selectedPromotions) {
        const promoPrice = getPromoPrice(promo.type, promo.duration);
        promotionsCost += promoPrice;

        if (promo.type !== 'HITNO') {
          const promoExpiresAt = new Date();
          promoExpiresAt.setDate(promoExpiresAt.getDate() + parseInt(promo.duration.toString()));
          promotionsToCreate.push({
            type: promo.type,
            expiresAt: promoExpiresAt,
            duration: parseInt(promo.duration.toString())
          });
        }
      }
    }

    let extraImagesCost = 0;
    const uploadedImagesCount = (images && Array.isArray(images)) ? images.length : 0;
    if (uploadedImagesCount > 15) {
      extraImagesCost = (uploadedImagesCount - 15) * getExtraImagePrice();
    }

    const totalCost = visibilityPrice + promotionsCost + extraImagesCost;

    if (userWallet.balance < totalCost) {
      const missingCredits = totalCost - userWallet.balance;
      return res.status(402).json({
        success: false,
        error: 'INSUFFICIENT_FUNDS',
        message: 'Nemate dovoljno kredita!',
        missingCredits,
        totalCost,
        balance: userWallet.balance
      });
    }

    const newAd = await db.transaction(async (tx) => {
      // 1. Deduct credits and log transaction
      if (totalCost > 0) {
        await tx.update(wallets)
          .set({ balance: userWallet.balance - totalCost, updatedAt: new Date() })
          .where(eq(wallets.id, userWallet.id));

        const promoNamesMap = {
          FEATURED: 'Istaknuti oglas',
          PRIORITY: 'Prioritetni oglas',
          TOP: 'Promocija na vrhu',
          COMBO: 'Premium oglas',
        };
        const promoDescs = promotionsToCreate.map(p => {
          const SerbianName = promoNamesMap[p.type as keyof typeof promoNamesMap] || p.type;
          return `${SerbianName} (${p.duration || 7} dana)`;
        });
        if (hasHitno) {
          promoDescs.push('Hitno značka');
        }
        const extraImagesCount = uploadedImagesCount - 15;
        if (extraImagesCount > 0) {
          promoDescs.push(`${extraImagesCount} dodatnih slika`);
        }
        const txnDesc = promoDescs.length > 0
          ? `Objava oglasa sa: ${promoDescs.join(', ')}`
          : `Objava oglasa (${duration} dana)`;

        await tx.insert(walletTransactions).values({
          walletId: userWallet.id,
          amount: -totalCost,
          type: 'SPEND',
          description: txnDesc,
        });
      }

      // 2. Insert ad
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + duration);
      const deletedAt = new Date(expiresAt.getTime() + 5 * 24 * 60 * 60 * 1000);

      const adAttributes = { ...(attributes || {}) };
      if (hasHitno) {
        adAttributes.isUrgent = true;
      }
      if (condition !== undefined) {
        adAttributes.condition = condition || null;
      }

      const [insertedAd] = await tx.insert(ads).values({
        title, description: description || '', price: price !== null && price !== undefined ? parseFloat(price.toString()) : null,
        currency: currency || null, isPriceOnRequest: isPriceOnRequest ?? isContact ?? false, category, country, city,
        address: finalAddress, lat: lat ?? null, lng: lng ?? null, phone: contactPhone || null,
        images: images || [], attributes: adAttributes, userId, expiresAt, deletedAt,
        showAddress: showAddress !== undefined ? !!showAddress : true,
        showPhone: showPhone !== undefined ? !!showPhone : true,
      }).returning();

      // 3. Insert promotions
      if (promotionsToCreate.length > 0) {
        for (const promo of promotionsToCreate) {
          await tx.insert(adPromotions).values({
            adId: insertedAd.id,
            type: promo.type,
            expiresAt: promo.expiresAt,
          });
        }
      }

      return insertedAd;
    });

    // Delete the draft ad if it exists
    try {
      if (draftId) {
        await db.delete(drafts).where(and(eq(drafts.userId, userId), eq(drafts.id, parseInt(draftId.toString()))));
      }
    } catch (draftDelErr) {
      console.error('Failed to delete draft after ad creation:', draftDelErr);
    }

    if (images && images.length > 0) {
      try {
        const matchingTempImages = await db.query.tempImages.findMany({ where: inArray(tempImages.url, images), columns: { id: true } });
        const idsToUpdate = new Set(matchingTempImages.map((t) => t.id));
        if (imageTempIds && Array.isArray(imageTempIds)) imageTempIds.forEach((id: number) => idsToUpdate.add(id));
        if (idsToUpdate.size > 0) await db.update(tempImages).set({ isPublished: true }).where(inArray(tempImages.id, Array.from(idsToUpdate)));
      } catch (err) { console.error('Failed to update temp images status:', err); }
    }

    // Bonus za prvi oglas
    try {
      const updatedWallet = await db.query.wallets.findFirst({ where: eq(wallets.userId, userId) });
      if (updatedWallet) {
        const bonusTransaction = await db.query.transactions.findFirst({
          where: and(eq(walletTransactions.walletId, updatedWallet.id), eq(walletTransactions.description, 'Bonus za prvi oglas')),
        });
        if (!bonusTransaction) {
          await db.update(wallets).set({ balance: updatedWallet.balance + 100 }).where(eq(wallets.id, updatedWallet.id));
          await db.insert(walletTransactions).values({ walletId: updatedWallet.id, amount: 100, type: 'DEPOSIT', description: 'Bonus za prvi oglas' });
        }
      }
    } catch (bonusErr) { console.error('Error giving first ad bonus:', bonusErr); }

    return res.json({ success: true, ad: newAd });
  } catch (err: any) {
    console.error('Error creating ad:', err);
    return res.status(500).json({ error: 'Greška pri kreiranju oglasa.', message: err.message });
  }
}

// GET /ads/:id — jedan oglas
export async function getAd(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ad ID' });

    const ad = await db.query.ads.findFirst({
      where: eq(ads.id, id),
      with: {
        user: { columns: { id: true, fullName: true, username: true, profileImg: true } },
        promotions: {
          where: (adPromotions, { gt }) => gt(adPromotions.expiresAt, new Date())
        }
      },
    });

    if (!ad) return res.status(404).json({ error: 'Ad not found' });
    return res.json({ success: true, ad });
  } catch (err: any) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// DELETE /ads/:id
export async function deleteAd(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ad ID' });

    const ad = await db.query.ads.findFirst({
      where: eq(ads.id, id)
    });

    if (!ad) {
      return res.status(404).json({ error: 'Oglas nije pronađen.' });
    }

    if (ad.userId !== req.user!.id) {
      return res.status(403).json({ error: 'Nemate dozvolu za brisanje ovog oglasa.' });
    }

    const reason = req.query.reason;

    if (reason === 'Prodato') {
      const now = Date.now();
      const createdAtTime = new Date(ad.createdAt).getTime();
      const isOlderThan12Hours = (now - createdAtTime) >= 12 * 60 * 60 * 1000;

      const adChats = await db.select().from(chats).where(eq(chats.adId, id));

      let hasValidSaleChat = false;
      for (const chat of adChats) {
        const chatAgeMs = now - new Date(chat.createdAt).getTime();
        const isChatAgeValid = chatAgeMs >= 12 * 60 * 60 * 1000 && chatAgeMs <= 15 * 24 * 60 * 60 * 1000;
        if (!isChatAgeValid) continue;

        const user1Msgs = await db
          .select({ count: count() })
          .from(messages)
          .where(and(eq(messages.conversationId, chat.id), eq(messages.senderId, chat.user1Id)));

        const user2Msgs = await db
          .select({ count: count() })
          .from(messages)
          .where(and(eq(messages.conversationId, chat.id), eq(messages.senderId, chat.user2Id)));

        const hasUser1Msg = (user1Msgs[0]?.count || 0) >= 1;
        const hasUser2Msg = (user2Msgs[0]?.count || 0) >= 1;

        if (hasUser1Msg && hasUser2Msg) {
          hasValidSaleChat = true;
          break;
        }
      }

      if (isOlderThan12Hours && hasValidSaleChat) {
        await db.insert(sales).values({
          sellerId: ad.userId,
          adId: ad.id,
          title: ad.title,
          price: ad.price,
          currency: ad.currency,
          category: ad.category,
          createdAt: new Date(),
        });
      }
    }

    try {
      if (ad.images && ad.images.length > 0) {
        const matchingTempImages = await db.query.tempImages.findMany({ where: inArray(tempImages.url, ad.images), columns: { id: true } });
        if (matchingTempImages.length > 0) {
          await db.update(tempImages).set({ isPublished: false }).where(inArray(tempImages.id, matchingTempImages.map((t) => t.id)));
        }
      }
    } catch (tempErr) { console.error('Failed to update temp images on delete:', tempErr); }

    await db.delete(ads).where(eq(ads.id, id));
    return res.json({ success: true });
  } catch (err: any) {
    console.error('Error deleting ad:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// PATCH /ads/reserved — označi oglas kao rezervisan/nerezervisan
export async function toggleReserved(req: Request, res: Response) {
  try {
    const { adId, isReserved } = req.body;
    const id = parseInt(adId);
    if (!adId || isNaN(id)) return res.status(400).json({ success: false, error: 'Invalid ad ID' });

    const userId = req.user!.id;
    const ad = await db.query.ads.findFirst({ where: eq(ads.id, id) });
    if (!ad) return res.status(404).json({ success: false, error: 'Oglas nije pronađen.' });
    if (ad.userId !== userId) return res.status(403).json({ success: false, error: 'Nemate pristup ovom oglasu.' });

    const nextVal = isReserved !== undefined ? !!isReserved : !ad.isReserved;
    await db.update(ads).set({ isReserved: nextVal }).where(eq(ads.id, id));
    return res.json({ success: true, isReserved: nextVal });
  } catch (err: any) {
    console.error('Error toggling reserved status:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

// PATCH /ads/:id
export async function updateAd(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ad ID' });

    const userId = req.user!.id;
    const {
      status, title, description, price, currency, condition, category, country, city, address, street, contactPhone, images, attributes, isPriceOnRequest, isContact, imageTempIds,
      visibilityDuration, selectedPromotions, showAddress, showPhone
    } = req.body;

    const currentAd = await db.query.ads.findFirst({ where: eq(ads.id, id) });
    if (!currentAd) {
      return res.status(404).json({ error: 'Oglas nije pronađen.' });
    }

    // Wallet & Pricing Check
    const userWallet = await db.query.wallets.findFirst({ where: eq(wallets.userId, userId) });
    if (!userWallet) {
      return res.status(404).json({ error: 'Novčanik nije pronađen.' });
    }

    const pricingList = await db.select().from(pricing);
    const getVisibilityPrice = (days: number) => {
      const item = pricingList.find(p => p.category === 'promocija' && (p.features as any)?.durationDays === days && p.name.includes("Objava oglasa"));
      return item ? item.price : 0;
    };
    const getPromoPrice = (type: string, days: number) => {
      if (type === 'HITNO') {
        const item = pricingList.find(p => p.category === 'promocija' && p.name.includes("Hitno"));
        return item ? item.price : 200;
      }
      const item = pricingList.find(p => p.category === 'promocija' && (p.features as any)?.durationDays === days && (p.features as any)?.type === type);
      return item ? item.price : 0;
    };
    const getExtraImagePrice = () => {
      const item = pricingList.find(p => p.category === 'promocija' && p.name === "Dodatno postavljanje slika");
      return item ? item.price : 10;
    };

    const duration = visibilityDuration ? parseInt(visibilityDuration.toString()) : null;
    const visibilityPrice = duration ? getVisibilityPrice(duration) : 0;

    let promotionsCost = 0;
    const promotionsToCreate: { type: any, expiresAt: Date, duration: number }[] = [];

    const hasHitno = selectedPromotions && Array.isArray(selectedPromotions) && selectedPromotions.some(p => p.type === 'HITNO');

    if (selectedPromotions && Array.isArray(selectedPromotions)) {
      for (const promo of selectedPromotions) {
        const promoPrice = getPromoPrice(promo.type, promo.duration);
        promotionsCost += promoPrice;

        if (promo.type !== 'HITNO') {
          const promoExpiresAt = new Date();
          promoExpiresAt.setDate(promoExpiresAt.getDate() + parseInt(promo.duration.toString()));
          promotionsToCreate.push({
            type: promo.type,
            expiresAt: promoExpiresAt,
            duration: parseInt(promo.duration.toString())
          });
        }
      }
    }

    let extraImagesCost = 0;
    let extraImagesCountToCharge = 0;
    if (images !== undefined && Array.isArray(images)) {
      const newImagesCount = images.length;
      const oldImagesCount = (currentAd.images && Array.isArray(currentAd.images)) ? currentAd.images.length : 0;
      extraImagesCountToCharge = Math.max(0, newImagesCount - Math.max(15, oldImagesCount));
      extraImagesCost = extraImagesCountToCharge * getExtraImagePrice();
    }

    const totalCost = visibilityPrice + promotionsCost + extraImagesCost;

    if (userWallet.balance < totalCost) {
      const missingCredits = totalCost - userWallet.balance;
      return res.status(402).json({
        success: false,
        error: 'INSUFFICIENT_FUNDS',
        message: 'Nemate dovoljno kredita!',
        missingCredits,
        totalCost,
        balance: userWallet.balance
      });
    }

    const updateData: any = {};
    if (status !== undefined) updateData.status = status.toUpperCase();
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price !== null ? parseFloat(price.toString()) : null;
    if (currency !== undefined) updateData.currency = currency;
    if (category !== undefined) updateData.category = category;
    if (country !== undefined) updateData.country = country;
    if (city !== undefined) updateData.city = city;
    
    const finalAddress = address !== undefined ? address : (street !== undefined ? street : undefined);
    if (finalAddress !== undefined) updateData.address = finalAddress;

    if (contactPhone !== undefined) updateData.phone = contactPhone;
    if (images !== undefined) updateData.images = images;
    
    const finalIsPriceOnRequest = isPriceOnRequest !== undefined ? isPriceOnRequest : (isContact !== undefined ? isContact : undefined);
    if (finalIsPriceOnRequest !== undefined) updateData.isPriceOnRequest = finalIsPriceOnRequest;

    if (showAddress !== undefined) updateData.showAddress = !!showAddress;
    if (showPhone !== undefined) updateData.showPhone = !!showPhone;

    const adAttributes = { ...(attributes || currentAd.attributes || {}) };
    if (hasHitno) {
      adAttributes.isUrgent = true;
    }
    if (condition !== undefined) {
      adAttributes.condition = condition || null;
    }
    updateData.attributes = adAttributes;

    let lat, lng;
    const geoAddress = finalAddress || currentAd.address;
    const geoCity = city || currentAd.city;
    if (geoAddress && geoCity) {
      try {
        const queryStr = `${geoAddress}, ${geoCity}, Serbia`;
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(queryStr)}&limit=1`, { headers: { 'User-Agent': 'Galset-App/1.0' } });
        const geoData = (await geoRes.json()) as any;
        if (geoData && geoData.length > 0) { lat = parseFloat(geoData[0].lat); lng = parseFloat(geoData[0].lon); }
      } catch (geoErr) { console.error('Geocoding error:', geoErr); }
    }

    if (lat !== undefined && lng !== undefined) { updateData.lat = lat; updateData.lng = lng; }
    else if (city) {
      const cityData = (cityCoords as any)[city];
      if (cityData) { updateData.lat = cityData.lat; updateData.lng = cityData.lng; }
    }

    const updatedAd = await db.transaction(async (tx) => {
      // 1. Deduct credits and log transaction
      if (totalCost > 0) {
        await tx.update(wallets)
          .set({ balance: userWallet.balance - totalCost, updatedAt: new Date() })
          .where(eq(wallets.id, userWallet.id));

        const promoNamesMap = {
          FEATURED: 'Istaknuti oglas',
          PRIORITY: 'Prioritetni oglas',
          TOP: 'Promocija na vrhu',
          COMBO: 'Premium oglas',
        };
        const promoDescs = promotionsToCreate.map(p => {
          const SerbianName = promoNamesMap[p.type as keyof typeof promoNamesMap] || p.type;
          return `${SerbianName} (${p.duration || 7} dana)`;
        });
        if (extraImagesCountToCharge > 0) {
          promoDescs.push(`${extraImagesCountToCharge} dodatnih slika`);
        }
        const txnDesc = promoDescs.length > 0
          ? `Kupovina promocija: ${promoDescs.join(', ')}`
          : `Izmena oglasa${duration ? ` (${duration} dana)` : ''}`;

        await tx.insert(walletTransactions).values({
          walletId: userWallet.id,
          amount: -totalCost,
          type: 'SPEND',
          description: txnDesc,
        });
      }

      // 2. Compute expiration updates
      if (duration) {
        const now = new Date();
        const newExpiresAt = new Date();
        newExpiresAt.setDate(newExpiresAt.getDate() + duration);
        if (!currentAd.expiresAt || currentAd.expiresAt < now || newExpiresAt > currentAd.expiresAt || duration > 30) {
          updateData.expiresAt = newExpiresAt;
          updateData.deletedAt = new Date(newExpiresAt.getTime() + 5 * 24 * 60 * 60 * 1000);
        }
      }

      // 3. Update ad
      if (Object.keys(updateData).length > 0) {
        await tx.update(ads).set(updateData).where(eq(ads.id, id));
      }

      // 4. Update promotions
      if (promotionsToCreate.length > 0) {
        const typesToDelete = promotionsToCreate.map(p => p.type);
        await tx.delete(adPromotions).where(and(eq(adPromotions.adId, id), inArray(adPromotions.type, typesToDelete)));
        for (const promo of promotionsToCreate) {
          await tx.insert(adPromotions).values({
            adId: id,
            type: promo.type,
            expiresAt: promo.expiresAt,
          });
        }
      }

      return tx.query.ads.findFirst({ where: eq(ads.id, id) });
    });

    const finalImages = images !== undefined ? images : [];
    if (finalImages.length > 0 || (imageTempIds && Array.isArray(imageTempIds) && imageTempIds.length > 0)) {
      try {
        const idsToUpdate = new Set<number>();
        if (finalImages.length > 0) {
          const matchingTempImages = await db.query.tempImages.findMany({ where: inArray(tempImages.url, finalImages), columns: { id: true } });
          matchingTempImages.forEach((t) => idsToUpdate.add(t.id));
        }
        if (imageTempIds && Array.isArray(imageTempIds)) imageTempIds.forEach((id: number) => idsToUpdate.add(id));
        if (idsToUpdate.size > 0) await db.update(tempImages).set({ isPublished: true }).where(inArray(tempImages.id, Array.from(idsToUpdate)));
      } catch (err) { console.error('Failed to update temp images status:', err); }
    }

    return res.json({ success: true, ad: updatedAd });
  } catch (err: any) {
    console.error('Error patching ad:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
