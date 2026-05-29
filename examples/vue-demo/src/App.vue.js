/// <reference types="../../../node_modules/.pnpm/@vue+language-core@3.2.6/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../node_modules/.pnpm/@vue+language-core@3.2.6/node_modules/@vue/language-core/types/props-fallback.d.ts" />
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
export default {};
const __VLS_export = await (async () => {
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
    const __VLS_ctx = {
        ...{},
        ...{},
    };
    let __VLS_components;
    let __VLS_intrinsics;
    let __VLS_directives;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ style: (__VLS_ctx.appStyle) },
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
        ...{ style: (__VLS_ctx.headerStyle) },
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
        ...{ style: ({ margin: 0, fontSize: '24px' }) },
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ style: ({ margin: '8px 0 0', color: '#666', fontSize: '14px' }) },
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
        href: "https://www.npmjs.com/package/@quikturn/logos-vue",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
        ...{ style: (__VLS_ctx.sectionStyle) },
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
        ...{ style: (__VLS_ctx.headingStyle) },
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ style: (__VLS_ctx.descStyle) },
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.code, __VLS_intrinsics.code)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ style: ({ display: 'flex', gap: '24px', alignItems: 'center' }) },
    });
    let __VLS_0;
    /** @ts-ignore @type {typeof __VLS_components.QuikturnLogo} */
    QuikturnLogo;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        domain: "github.com",
        size: (64),
    }));
    const __VLS_2 = __VLS_1({
        domain: "github.com",
        size: (64),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    let __VLS_5;
    /** @ts-ignore @type {typeof __VLS_components.QuikturnLogo} */
    QuikturnLogo;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
        domain: "stripe.com",
        size: (64),
        format: "webp",
    }));
    const __VLS_7 = __VLS_6({
        domain: "stripe.com",
        size: (64),
        format: "webp",
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    let __VLS_10;
    /** @ts-ignore @type {typeof __VLS_components.QuikturnLogo} */
    QuikturnLogo;
    // @ts-ignore
    const __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({
        domain: "vercel.com",
        size: (64),
        greyscale: true,
    }));
    const __VLS_12 = __VLS_11({
        domain: "vercel.com",
        size: (64),
        greyscale: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_11));
    let __VLS_15;
    /** @ts-ignore @type {typeof __VLS_components.QuikturnLogo} */
    QuikturnLogo;
    // @ts-ignore
    const __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
        domain: "figma.com",
        size: (64),
        href: "https://figma.com",
    }));
    const __VLS_17 = __VLS_16({
        domain: "figma.com",
        size: (64),
        href: "https://figma.com",
    }, ...__VLS_functionalComponentArgsRest(__VLS_16));
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
        ...{ style: (__VLS_ctx.sectionStyle) },
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
        ...{ style: (__VLS_ctx.headingStyle) },
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ style: (__VLS_ctx.descStyle) },
    });
    let __VLS_20;
    /** @ts-ignore @type {typeof __VLS_components.QuikturnLogoCarousel} */
    QuikturnLogoCarousel;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
        domains: (__VLS_ctx.partners),
        speed: (80),
        logoHeight: (32),
        gap: (64),
        fadeOut: true,
        pauseOnHover: true,
    }));
    const __VLS_22 = __VLS_21({
        domains: (__VLS_ctx.partners),
        speed: (80),
        logoHeight: (32),
        gap: (64),
        fadeOut: true,
        pauseOnHover: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
        ...{ style: (__VLS_ctx.sectionStyle) },
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
        ...{ style: (__VLS_ctx.headingStyle) },
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ style: (__VLS_ctx.descStyle) },
    });
    let __VLS_25;
    /** @ts-ignore @type {typeof __VLS_components.QuikturnLogoGrid} */
    QuikturnLogoGrid;
    // @ts-ignore
    const __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({
        logos: (__VLS_ctx.partnerLogos),
        columns: (2),
        gap: (32),
    }));
    const __VLS_27 = __VLS_26({
        logos: (__VLS_ctx.partnerLogos),
        columns: (2),
        gap: (32),
    }, ...__VLS_functionalComponentArgsRest(__VLS_26));
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
        ...{ style: (__VLS_ctx.sectionStyle) },
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
        ...{ style: (__VLS_ctx.headingStyle) },
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ style: (__VLS_ctx.descStyle) },
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ style: ({ height: '240px', border: '1px solid #e0e0e0', borderRadius: '8px' }) },
    });
    let __VLS_30;
    /** @ts-ignore @type {typeof __VLS_components.QuikturnLogoCarousel} */
    QuikturnLogoCarousel;
    // @ts-ignore
    const __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({
        domains: (['github.com', 'stripe.com', 'vercel.com', 'figma.com', 'linear.app', 'notion.so']),
        direction: "up",
        speed: (60),
        logoHeight: (24),
        gap: (24),
    }));
    const __VLS_32 = __VLS_31({
        domains: (['github.com', 'stripe.com', 'vercel.com', 'figma.com', 'linear.app', 'notion.so']),
        direction: "up",
        speed: (60),
        logoHeight: (24),
        gap: (24),
    }, ...__VLS_functionalComponentArgsRest(__VLS_31));
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
        ...{ style: (__VLS_ctx.sectionStyle) },
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
        ...{ style: (__VLS_ctx.headingStyle) },
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ style: (__VLS_ctx.descStyle) },
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.code, __VLS_intrinsics.code)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ style: ({ display: 'flex', gap: '16px', alignItems: 'center' }) },
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        placeholder: "Enter a domain",
        ...{ style: (__VLS_ctx.inputStyle) },
    });
    (__VLS_ctx.composableDomain);
    __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
        src: (__VLS_ctx.composableUrl),
        alt: (`${__VLS_ctx.composableDomain} logo`),
        ...{ style: ({ height: '48px', width: 'auto' }) },
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.footer, __VLS_intrinsics.footer)({
        ...{ style: (__VLS_ctx.footerStyle) },
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
        href: "https://getquikturn.io",
    });
    // @ts-ignore
    [appStyle, headerStyle, sectionStyle, sectionStyle, sectionStyle, sectionStyle, sectionStyle, headingStyle, headingStyle, headingStyle, headingStyle, headingStyle, descStyle, descStyle, descStyle, descStyle, descStyle, partners, partnerLogos, inputStyle, composableDomain, composableDomain, composableUrl, footerStyle,];
    return (await import('vue')).defineComponent({});
})();
