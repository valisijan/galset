CREATE INDEX "Ad_status_expiresAt_idx" ON "Ad" USING btree ("status","expiresAt");--> statement-breakpoint
CREATE INDEX "Ad_createdAt_idx" ON "Ad" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "Ad_userId_idx" ON "Ad" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "Ad_category_idx" ON "Ad" USING btree ("category");--> statement-breakpoint
CREATE INDEX "Ad_city_idx" ON "Ad" USING btree ("city");