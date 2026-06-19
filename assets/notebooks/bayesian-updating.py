import marimo

__generated_with = "0.10.0"
app = marimo.App(width="medium")


@app.cell
def __(mo):
    mo.md(
        r"""
        # Bayesian Updating

        Watch your beliefs update as new evidence arrives.

        We start with a **prior** — your belief about the probability of some event
        before seeing any data. Each coin flip updates it into a **posterior**.

        Adjust the sliders to change your prior and the observed data.
        """
    )
    return


@app.cell
def __(mo):
    prior_heads = mo.ui.slider(
        1, 20, value=5, label="Prior: pseudo-counts for Heads (α)"
    )
    prior_tails = mo.ui.slider(
        1, 20, value=5, label="Prior: pseudo-counts for Tails (β)"
    )
    observed_heads = mo.ui.slider(
        0, 50, value=10, label="Observed Heads"
    )
    observed_tails = mo.ui.slider(
        0, 50, value=10, label="Observed Tails"
    )

    mo.vstack([
        mo.md("### Prior (Beta distribution)"),
        prior_heads,
        prior_tails,
        mo.md("### Observed data"),
        observed_heads,
        observed_tails,
    ])
    return observed_heads, observed_tails, prior_heads, prior_tails


@app.cell
def __(observed_heads, observed_tails, prior_heads, prior_tails):
    import numpy as np
    from scipy.stats import beta
    import matplotlib.pyplot as plt
    import matplotlib

    matplotlib.rcParams["figure.facecolor"] = "#faf7f2"
    matplotlib.rcParams["axes.facecolor"] = "#faf7f2"

    alpha_prior = prior_heads.value
    beta_prior  = prior_tails.value
    alpha_post  = alpha_prior + observed_heads.value
    beta_post   = beta_prior  + observed_tails.value

    x = np.linspace(0, 1, 300)

    fig, ax = plt.subplots(figsize=(8, 4))

    ax.plot(x, beta.pdf(x, alpha_prior, beta_prior),
            color="#a07850", linewidth=2, linestyle="--", label=f"Prior  Beta({alpha_prior}, {beta_prior})")
    ax.plot(x, beta.pdf(x, alpha_post, beta_post),
            color="#b85c38", linewidth=2.5, label=f"Posterior  Beta({alpha_post}, {beta_post})")

    ax.fill_between(x, beta.pdf(x, alpha_post, beta_post),
                    alpha=0.15, color="#b85c38")

    posterior_mean = alpha_post / (alpha_post + beta_post)
    ax.axvline(posterior_mean, color="#b85c38", linewidth=1, linestyle=":",
               label=f"Posterior mean = {posterior_mean:.2f}")

    ax.set_xlabel("p (probability of Heads)", fontsize=12)
    ax.set_ylabel("Density", fontsize=12)
    ax.set_title("Prior → Posterior", fontsize=14)
    ax.legend(fontsize=10)
    ax.spines[["top", "right"]].set_visible(False)

    plt.tight_layout()
    fig
    return (
        alpha_post,
        alpha_prior,
        ax,
        beta,
        beta_post,
        beta_prior,
        fig,
        matplotlib,
        np,
        plt,
        posterior_mean,
        x,
    )


@app.cell
def __(alpha_post, alpha_prior, beta_post, beta_prior, mo, posterior_mean):
    mo.callout(
        mo.md(
            f"""
            **Prior:** Beta({alpha_prior}, {beta_prior}) — mean = {alpha_prior / (alpha_prior + beta_prior):.2f}

            **Posterior:** Beta({alpha_post}, {beta_post}) — mean = {posterior_mean:.2f}

            The posterior mean is a weighted average of the prior mean and the
            observed frequency. With more data the prior gets overwhelmed — try
            cranking up the observed counts to see this in action.
            """
        ),
        kind="info",
    )
    return


@app.cell
def __():
    import marimo as mo
    return (mo,)


if __name__ == "__main__":
    app.run()
