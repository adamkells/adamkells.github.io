---
layout: post
title: Low Count Anomaly Detection
subtitle: How to do anomaly detection on high signal to noise ratio data.
image: /assets/anomaly.png
tags: [time-series, 'til']
comments: false
archived: true
---

[Link to paper](https://arxiv.org/abs/2308.12925)

Today I learned about a way of improving anomaly detection (AD) in low volume sales data in this [paper](https://arxiv.org/abs/2308.12925).

The main idea was that sometimes when working with time series data, the magnitude of the values can be quite small resulting in a high signal-to-noise ratio. They inspected how a number of common anomaly detection perform when the magnitude is pretty small.

Their primary finding was that at low volumes, most AD methods struggle but the accuracy can be improved by smoothing the anomaly metric (although this creates a lag effect).

## Main Ideas

### Generate Synthetic Count Data

To test this idea out, they generated some synthetic data using a [Poisson distribution](https://en.wikipedia.org/wiki/Poisson_distribution) . The Poisson distribution gives the probability of a number of events happening in an interval of time (assuming the events are independent). The Poisson distribution only needs a single parameter $\lambda$ which describes the rate at which events happen.  We can write some simple python code to recreate this.

```python
import numpy as np

def generate_periodic_poisson_data(periods, frequency, magnitude):
    time = np.arange(periods)
    lambda_param = magnitude * (1 + np.cos(2 * np.pi * time / frequency))
    data = np.random.poisson(lambda_param)
    return data, lambda_param

periods = 50  # Number of periods
frequency = 10  # Frequency of the periodic signal
magnitude = 3.0  # Maximum magnitude of the lambda parameter

count_data, lambda_param = generate_periodic_poisson_data(periods, frequency, magnitude)
```


### Switch on Anomalies using Markov Chain

The above gives the simple synthetic data with no anomalies. To simulate anomalies, we use a Markov chain to determine when we will apply a reduction to the $\lambda$ parameter.

A Markov chain is a simple mathematical model that describes the probability of switching between states (where the probability of switching depends only on the current state). It is made of the following four probabilities:

1. Transition probability from "Anomalies Off" to "Anomalies Off".
2. Transition probability from "Anomalies Off" to "Anomalies On".
3. Transition probability from "Anomalies On" to "Anomalies Off".
4. Transition probability from "Anomalies On" to "Anomalies On".

This simple method allows the authors to have the anomalies switch on and off randomly (but with predictable frequency).

### Forecasting AD performs best at low counts
They look at a selection of different AD algorithms and find that the best method is to use a forecasting algorithm and take the difference between truth and prediction as a metric. At very low count volume, all of the methods perform effectively no better than random.

They also note that some methods struggle due to memory effects i.e. the second time they see anomalies they will be ignored since they have been seen previously. This requires a bit of extra logic to try and remove this effect.

### Smoothing improves accuracy but adds a lag

The authors found that by applying an exponentially weighted moving average to the anomaly metric they could improve the accuracy of the method.

However this came at a cost that it introduces a lag effect that the algorithm is slower to recognise the first anomalous points. Also, once the anomalous period ends, the early points are likely to be false positives due to the smoothing.
