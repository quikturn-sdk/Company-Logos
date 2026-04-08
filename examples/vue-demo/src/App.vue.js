/// <reference types="../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref } from "vue";
import { QuikturnLogo, QuikturnLogoCarousel, QuikturnLogoGrid, useLogoUrl, } from "@quikturn/logos-vue";
// ---------------------------------------------------------------------------
// Styles (declared as module-level constants for template binding)
// ---------------------------------------------------------------------------
const appStyle = {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "32px 24px",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};
const headerStyle = {
    marginBottom: "40px",
    paddingBottom: "24px",
    borderBottom: "1px solid #e0e0e0",
};
const sectionStyle = {
    marginBottom: "48px",
};
const headingStyle = {
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "4px",
};
const descStyle = {
    fontSize: "14px",
    color: "#666",
    marginBottom: "16px",
};
const footerStyle = {
    marginTop: "64px",
    paddingTop: "24px",
    borderTop: "1px solid #e0e0e0",
    fontSize: "13px",
    color: "#999",
    textAlign: "center",
};
const inputStyle = {
    padding: "8px 12px",
    fontSize: "14px",
    border: "1px solid #d0d0d0",
    borderRadius: "6px",
    outline: "none",
    width: "220px",
};
debugger; /* PartiallyEnd: #3632/both.vue */
export default await (async () => {
    // ---------------------------------------------------------------------------
    // Data
    // ---------------------------------------------------------------------------
    const partners = [
        "github.com",
        "stripe.com",
        "vercel.com",
        "figma.com",
        "linear.app",
        "notion.so",
        "slack.com",
        "discord.com",
    ];
    const partnerLogos = [
        { domain: "github.com", href: "https://github.com", alt: "GitHub" },
        { domain: "stripe.com", href: "https://stripe.com", alt: "Stripe" },
        { domain: "vercel.com", href: "https://vercel.com", alt: "Vercel" },
        { domain: "figma.com", href: "https://figma.com", alt: "Figma" },
    ];
    // ---------------------------------------------------------------------------
    // Composable demo
    // ---------------------------------------------------------------------------
    const composableDomain = ref("github.com");
    const composableUrl = useLogoUrl(composableDomain, { size: 256, format: "webp" });
    debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
    const __VLS_ctx = {};
    let __VLS_components;
    let __VLS_directives;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ style: (__VLS_ctx.appStyle) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.header, __VLS_intrinsicElements.header)({
        ...{ style: (__VLS_ctx.headerStyle) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({
        ...{ style: ({ margin: 0, fontSize: '24px' }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ style: ({ margin: '8px 0 0', color: '#666', fontSize: '14px' }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.a, __VLS_intrinsicElements.a)({
        href: "https://www.npmjs.com/package/@quikturn/logos-vue",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ style: (__VLS_ctx.sectionStyle) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
        ...{ style: (__VLS_ctx.headingStyle) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ style: (__VLS_ctx.descStyle) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.code, __VLS_intrinsicElements.code)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ style: ({ display: 'flex', gap: '24px', alignItems: 'center' }) },
    });
    const __VLS_0 = {}.QuikturnLogo;
    /** @type {[typeof __VLS_components.QuikturnLogo, ]} */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        domain: "github.com",
        size: (64),
    }));
    const __VLS_2 = __VLS_1({
        domain: "github.com",
        size: (64),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    const __VLS_4 = {}.QuikturnLogo;
    /** @type {[typeof __VLS_components.QuikturnLogo, ]} */ ;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
        domain: "stripe.com",
        size: (64),
        format: "webp",
    }));
    const __VLS_6 = __VLS_5({
        domain: "stripe.com",
        size: (64),
        format: "webp",
    }, ...__VLS_functionalComponentArgsRest(__VLS_5));
    const __VLS_8 = {}.QuikturnLogo;
    /** @type {[typeof __VLS_components.QuikturnLogo, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        domain: "vercel.com",
        size: (64),
        greyscale: true,
    }));
    const __VLS_10 = __VLS_9({
        domain: "vercel.com",
        size: (64),
        greyscale: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    const __VLS_12 = {}.QuikturnLogo;
    /** @type {[typeof __VLS_components.QuikturnLogo, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
        domain: "figma.com",
        size: (64),
        href: "https://figma.com",
    }));
    const __VLS_14 = __VLS_13({
        domain: "figma.com",
        size: (64),
        href: "https://figma.com",
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ style: (__VLS_ctx.sectionStyle) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
        ...{ style: (__VLS_ctx.headingStyle) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ style: (__VLS_ctx.descStyle) },
    });
    const __VLS_16 = {}.QuikturnLogoCarousel;
    /** @type {[typeof __VLS_components.QuikturnLogoCarousel, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        domains: (__VLS_ctx.partners),
        speed: (80),
        logoHeight: (32),
        gap: (64),
        fadeOut: true,
        pauseOnHover: true,
    }));
    const __VLS_18 = __VLS_17({
        domains: (__VLS_ctx.partners),
        speed: (80),
        logoHeight: (32),
        gap: (64),
        fadeOut: true,
        pauseOnHover: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ style: (__VLS_ctx.sectionStyle) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
        ...{ style: (__VLS_ctx.headingStyle) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ style: (__VLS_ctx.descStyle) },
    });
    const __VLS_20 = {}.QuikturnLogoGrid;
    /** @type {[typeof __VLS_components.QuikturnLogoGrid, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
        logos: (__VLS_ctx.partnerLogos),
        columns: (2),
        gap: (32),
    }));
    const __VLS_22 = __VLS_21({
        logos: (__VLS_ctx.partnerLogos),
        columns: (2),
        gap: (32),
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ style: (__VLS_ctx.sectionStyle) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
        ...{ style: (__VLS_ctx.headingStyle) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ style: (__VLS_ctx.descStyle) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ style: ({ height: '240px', border: '1px solid #e0e0e0', borderRadius: '8px' }) },
    });
    const __VLS_24 = {}.QuikturnLogoCarousel;
    /** @type {[typeof __VLS_components.QuikturnLogoCarousel, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
        domains: (['github.com', 'stripe.com', 'vercel.com', 'figma.com', 'linear.app', 'notion.so']),
        direction: "up",
        speed: (60),
        logoHeight: (24),
        gap: (24),
    }));
    const __VLS_26 = __VLS_25({
        domains: (['github.com', 'stripe.com', 'vercel.com', 'figma.com', 'linear.app', 'notion.so']),
        direction: "up",
        speed: (60),
        logoHeight: (24),
        gap: (24),
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ style: (__VLS_ctx.sectionStyle) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
        ...{ style: (__VLS_ctx.headingStyle) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ style: (__VLS_ctx.descStyle) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.code, __VLS_intrinsicElements.code)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ style: ({ display: 'flex', gap: '16px', alignItems: 'center' }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        placeholder: "Enter a domain",
        ...{ style: (__VLS_ctx.inputStyle) },
    });
    (__VLS_ctx.composableDomain);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
        src: (__VLS_ctx.composableUrl),
        alt: (`${__VLS_ctx.composableDomain} logo`),
        ...{ style: ({ height: '48px', width: 'auto' }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.footer, __VLS_intrinsicElements.footer)({
        ...{ style: (__VLS_ctx.footerStyle) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.a, __VLS_intrinsicElements.a)({
        href: "https://getquikturn.io",
    });
    var __VLS_dollars;
    const __VLS_self = (await import('vue')).defineComponent({
        setup() {
            return {
                QuikturnLogo: QuikturnLogo,
                QuikturnLogoCarousel: QuikturnLogoCarousel,
                QuikturnLogoGrid: QuikturnLogoGrid,
                partners: partners,
                partnerLogos: partnerLogos,
                composableDomain: composableDomain,
                composableUrl: composableUrl,
                appStyle: appStyle,
                headerStyle: headerStyle,
                sectionStyle: sectionStyle,
                headingStyle: headingStyle,
                descStyle: descStyle,
                footerStyle: footerStyle,
                inputStyle: inputStyle,
            };
        },
    });
    return (await import('vue')).defineComponent({
        setup() {
            return {};
        },
    });
})(); /* PartiallyEnd: #4569/main.vue */
