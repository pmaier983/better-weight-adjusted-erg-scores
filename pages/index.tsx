import type { NextPage } from "next";
import { useState } from "react";
import { TimePicker, TimePrecision } from "@blueprintjs/datetime";
import { Button, ButtonGroup, Intent, NumericInput } from "@blueprintjs/core";

import styles from "../styles/Home.module.css";
import { WeightAdjustment } from "../script/onSubmit";

const SystemSelector = ({
  imperialText,
  metricText,
  id,
}: {
  metricText: string;
  imperialText: string;
  id: string;
}) => {
  const [isMetric, setIsMetric] = useState(true);
  return (
    <ButtonGroup className={styles.systemSelector}>
      <Button
        active={!!isMetric}
        onClick={() => {
          setIsMetric(true);
        }}
        intent={Intent.WARNING}
        id={`${id}Metric${isMetric ? "Active" : ""}`}
      >
        {metricText}
      </Button>
      <Button
        active={!isMetric}
        onClick={() => {
          setIsMetric(false);
        }}
        intent={Intent.WARNING}
      >
        {imperialText}
      </Button>
    </ButtonGroup>
  );
};

const Home: NextPage = () => {
  const [finalValue, setFinalValue] = useState<string | number>();
  return (
    <div className={styles.pageStyles}>
      <h1>Better Weight Adjusted Erg Scores!</h1>
      <h3>Why should you use this weight adjusting formula?</h3>
      <ul className={styles.reasonsList}>
        <li>Calibrated for fours instead of eights like in C2</li>
        <li>
          More transparent in the reasoning behind the components of the formula
        </li>
        <li>It is less aggressive at lower weights</li>
      </ul>

      <form
        className={styles.inputsContainer}
        onSubmit={(e) => {
          e.preventDefault();

          const formTarget: any = e.target;

          const isDistanceMetric =
            formTarget?.distanceMetricActive?.id === "distanceMetricActive";
          const isWeightMetric =
            formTarget?.weightMetricActive?.id === "weightMetricActive";

          const weightRaw = parseInt(formTarget?.weight.value, 10);
          const distanceRaw = parseInt(formTarget?.distance.value, 10);

          const distanceMetric = isDistanceMetric
            ? distanceRaw
            : distanceRaw * 1609.344;
          const weightMetric = isWeightMetric
            ? weightRaw
            : weightRaw * 0.453592;

          // This will break with any change to form order... don't do this.
          const hours = parseInt(formTarget[5].value, 10);
          const minutes = parseInt(formTarget[6].value, 10);
          const seconds = parseInt(formTarget[7].value, 10);

          if (0 === hours && 0 === minutes && 0 === seconds) {
            setFinalValue("Input a Time!");
            return;
          }
          const [resultMin, resultSec] = WeightAdjustment(
            distanceMetric,
            minutes + hours * 60,
            seconds,
            weightMetric
          );

          if (resultMin > 60) {
            setFinalValue(
              `${Math.floor(resultMin / 60)}:${resultMin % 60}:${resultSec}`
            );
          } else {
            setFinalValue(`${resultMin}:${resultSec}`);
          }
        }}
      >
        <div className={styles.inputContainer}>
          <h4>Distance</h4>
          <NumericInput
            min={1}
            required
            id="distance"
            stepSize={1000}
            majorStepSize={5000}
          />
          <SystemSelector
            metricText="metric (meters)"
            imperialText="imperial (miles)"
            id="distance"
          />
        </div>
        <div className={styles.inputContainer}>
          <h4>Time</h4>
          <TimePicker
            precision={TimePrecision.SECOND}
            selectAllOnFocus
            showArrowButtons
          />
        </div>
        <div className={styles.inputContainer}>
          <h4>Weight</h4>
          <NumericInput min={1} required id="weight" majorStepSize={10} />
          <SystemSelector
            metricText="metric (kg)"
            imperialText="imperial (lb)"
            id="weight"
          />
        </div>
        <Button
          intent={Intent.PRIMARY}
          type="submit"
          className={styles.submitButton}
        >
          Calculate
        </Button>
      </form>
      <div className={styles.result}>{finalValue}</div>
    </div>
  );
};

export default Home;
