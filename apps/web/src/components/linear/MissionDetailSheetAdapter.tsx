"use client"

/**
 * Adapter component to make the Linear MissionDetailSheet compatible
 * with the existing @zzik/ui MissionDetailSheet interface
 */

import type { MissionDetailSheetProps as UIPackageProps } from '@zzik/ui'
import { MissionDetailSheet } from './MissionDetailSheet'

export function MissionDetailSheetAdapter(props: UIPackageProps) {
  return (
    <MissionDetailSheet
      open={props.open}
      onClose={props.onClose}
      missionTitle={props.missionTitle}
      placeName={props.placeName}
      placeCategory={props.placeCategory}
      placeArea={props.placeArea}
      rewardAmount={props.rewardAmount}
      isGold={props.isGold}
      missionConditions={props.missionConditions}
      timeRemaining={props.timeRemaining}
      maxParticipations={props.maxParticipations}
      currentStep={props.currentStep}
      onStart={props.onStart}
      onVerifyGps={props.onVerifyGps}
      onVerifyQr={props.onVerifyQr}
      onVerifyReels={props.onVerifyReels}
    >
      {props.children}
    </MissionDetailSheet>
  )
}
