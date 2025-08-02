"""
AI Leadership 4Dx - Report Generator Service
"""

import os
import tempfile
from datetime import datetime
from typing import Dict, Any
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.pdfgen import canvas
import matplotlib.pyplot as plt
import numpy as np
import logging

logger = logging.getLogger(__name__)


class ReportGenerator:
    """PDF 보고서 생성기"""
    
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()
    
    def _setup_custom_styles(self):
        """커스텀 스타일 설정"""
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1f2937'),
            spaceAfter=30,
            alignment=TA_CENTER
        ))
        
        self.styles.add(ParagraphStyle(
            name='SectionTitle',
            parent=self.styles['Heading2'],
            fontSize=16,
            textColor=colors.HexColor('#4f46e5'),
            spaceAfter=20,
            spaceBefore=20
        ))
        
        self.styles.add(ParagraphStyle(
            name='BodyTextJustify',
            parent=self.styles['BodyText'],
            alignment=TA_JUSTIFY,
            fontSize=11,
            leading=16
        ))
    
    def generate_pdf(self, user_data: Dict[str, Any], analysis_data: Dict[str, Any]) -> str:
        """PDF 보고서 생성"""
        try:
            # 임시 파일 생성
            pdf_file = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
            pdf_path = pdf_file.name
            pdf_file.close()
            
            # PDF 문서 생성
            doc = SimpleDocTemplate(
                pdf_path,
                pagesize=A4,
                rightMargin=72,
                leftMargin=72,
                topMargin=72,
                bottomMargin=18,
            )
            
            # 컨텐츠 생성
            story = []
            
            # 표지
            story.extend(self._create_cover_page(user_data, analysis_data))
            story.append(PageBreak())
            
            # 요약
            story.extend(self._create_executive_summary(analysis_data))
            story.append(PageBreak())
            
            # 상세 분석
            story.extend(self._create_detailed_analysis(analysis_data))
            story.append(PageBreak())
            
            # 시각화
            story.extend(self._create_visualizations(analysis_data))
            story.append(PageBreak())
            
            # 개발 계획
            story.extend(self._create_development_plan(analysis_data))
            
            # PDF 생성
            doc.build(story)
            
            return pdf_path
            
        except Exception as e:
            logger.error(f"PDF generation error: {str(e)}")
            raise
    
    def _create_cover_page(self, user_data: Dict, analysis_data: Dict) -> list:
        """표지 생성"""
        elements = []
        
        # 제목
        elements.append(Spacer(1, 2*inch))
        elements.append(Paragraph(
            "AI Leadership 4Dx",
            self.styles['CustomTitle']
        ))
        elements.append(Paragraph(
            "리더십 분석 보고서",
            self.styles['CustomTitle']
        ))
        
        elements.append(Spacer(1, 1*inch))
        
        # 사용자 정보
        info_data = [
            ["이름", user_data.get('name', '')],
            ["조직", user_data.get('organization', '')],
            ["부서", user_data.get('department', '')],
            ["직급", user_data.get('position', '')],
            ["분석일", datetime.fromisoformat(analysis_data['created_at']).strftime('%Y년 %m월 %d일')]
        ]
        
        info_table = Table(info_data, colWidths=[2*inch, 3*inch])
        info_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 12),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ]))
        
        elements.append(info_table)
        
        return elements
    
    def _create_executive_summary(self, analysis_data: Dict) -> list:
        """요약 페이지 생성"""
        elements = []
        
        elements.append(Paragraph("핵심 요약", self.styles['SectionTitle']))
        
        # 리더십 스타일
        elements.append(Paragraph(
            f"<b>리더십 스타일:</b> {analysis_data['leadership_style']}",
            self.styles['BodyText']
        ))
        elements.append(Spacer(1, 0.2*inch))
        
        # 위험도
        risk_color = {
            'low': 'green',
            'medium': 'orange',
            'high': 'red'
        }.get(analysis_data['overall_risk_level'], 'black')
        
        elements.append(Paragraph(
            f"<b>전반적 위험도:</b> <font color='{risk_color}'>{analysis_data['overall_risk_level'].upper()}</font>",
            self.styles['BodyText']
        ))
        elements.append(Spacer(1, 0.2*inch))
        
        # 핵심 점수
        scores_data = [
            ["차원", "점수", "평가"],
            ["People (사람)", f"{analysis_data['blake_mouton_people']:.1f}", self._get_score_evaluation(analysis_data['blake_mouton_people'])],
            ["Production (성과)", f"{analysis_data['blake_mouton_production']:.1f}", self._get_score_evaluation(analysis_data['blake_mouton_production'])],
            ["LMX (관계품질)", f"{analysis_data['lmx_score']:.1f}", self._get_score_evaluation(analysis_data['lmx_score'])],
        ]
        
        scores_table = Table(scores_data, colWidths=[2*inch, 1.5*inch, 2*inch])
        scores_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 11),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        elements.append(scores_table)
        
        return elements
    
    def _create_detailed_analysis(self, analysis_data: Dict) -> list:
        """상세 분석 페이지 생성"""
        elements = []
        
        elements.append(Paragraph("상세 분석", self.styles['SectionTitle']))
        
        # 강점
        insights = analysis_data.get('ai_insights', {})
        
        if insights.get('strengths'):
            elements.append(Paragraph("<b>강점</b>", self.styles['Heading3']))
            for strength in insights['strengths']:
                elements.append(Paragraph(f"• {strength}", self.styles['BodyText']))
            elements.append(Spacer(1, 0.3*inch))
        
        # 약점
        if insights.get('weaknesses'):
            elements.append(Paragraph("<b>개선 영역</b>", self.styles['Heading3']))
            for weakness in insights['weaknesses']:
                elements.append(Paragraph(f"• {weakness}", self.styles['BodyText']))
            elements.append(Spacer(1, 0.3*inch))
        
        # 개선 제안
        if insights.get('improvements'):
            elements.append(Paragraph("<b>개선 제안</b>", self.styles['Heading3']))
            for improvement in insights['improvements']:
                elements.append(Paragraph(f"• {improvement}", self.styles['BodyText']))
        
        return elements
    
    def _create_visualizations(self, analysis_data: Dict) -> list:
        """시각화 페이지 생성"""
        elements = []
        
        elements.append(Paragraph("시각적 분석", self.styles['SectionTitle']))
        
        # 레이더 차트 생성
        radar_path = self._create_radar_chart(analysis_data)
        if radar_path:
            elements.append(Image(radar_path, width=4*inch, height=4*inch))
            elements.append(Spacer(1, 0.3*inch))
        
        # 막대 그래프 생성
        bar_path = self._create_bar_chart(analysis_data)
        if bar_path:
            elements.append(Image(bar_path, width=5*inch, height=3*inch))
        
        return elements
    
    def _create_development_plan(self, analysis_data: Dict) -> list:
        """개발 계획 페이지 생성"""
        elements = []
        
        elements.append(Paragraph("개인 개발 계획", self.styles['SectionTitle']))
        
        insights = analysis_data.get('ai_insights', {})
        plan = insights.get('development_plan', [])
        
        if plan:
            for i, item in enumerate(plan, 1):
                elements.append(Paragraph(
                    f"<b>{i}.</b> {item}",
                    self.styles['BodyTextJustify']
                ))
                elements.append(Spacer(1, 0.2*inch))
        
        # 마무리 메시지
        elements.append(Spacer(1, 0.5*inch))
        elements.append(Paragraph(
            "이 보고서는 AI Leadership 4Dx 시스템에 의해 자동으로 생성되었습니다. "
            "지속적인 자기 개발과 피드백을 통해 더 나은 리더가 되시길 응원합니다.",
            self.styles['BodyTextJustify']
        ))
        
        return elements
    
    def _create_radar_chart(self, analysis_data: Dict) -> str:
        """레이더 차트 생성"""
        try:
            # 데이터 준비
            categories = ['People', 'Production', 'Care', 'Challenge', 'LMX']
            values = [
                analysis_data['blake_mouton_people'],
                analysis_data['blake_mouton_production'],
                analysis_data['feedback_care'],
                analysis_data['feedback_challenge'],
                analysis_data['lmx_score']
            ]
            
            # 차트 생성
            angles = np.linspace(0, 2 * np.pi, len(categories), endpoint=False).tolist()
            values += values[:1]  # 닫기
            angles += angles[:1]
            
            fig, ax = plt.subplots(figsize=(6, 6), subplot_kw=dict(projection='polar'))
            ax.plot(angles, values, 'o-', linewidth=2, color='#4f46e5')
            ax.fill(angles, values, alpha=0.25, color='#4f46e5')
            ax.set_theta_offset(np.pi / 2)
            ax.set_theta_direction(-1)
            ax.set_xticks(angles[:-1])
            ax.set_xticklabels(categories)
            ax.set_ylim(0, 7)
            ax.set_title('리더십 차원 분석', size=16, y=1.08)
            ax.grid(True)
            
            # 저장
            chart_file = tempfile.NamedTemporaryFile(delete=False, suffix='.png')
            plt.savefig(chart_file.name, bbox_inches='tight', dpi=150)
            plt.close()
            
            return chart_file.name
            
        except Exception as e:
            logger.error(f"Radar chart creation error: {str(e)}")
            return None
    
    def _create_bar_chart(self, analysis_data: Dict) -> str:
        """막대 그래프 생성"""
        try:
            # 데이터 준비
            dimensions = ['People', 'Production', 'LMX']
            scores = [
                analysis_data['blake_mouton_people'],
                analysis_data['blake_mouton_production'],
                analysis_data['lmx_score']
            ]
            
            # 차트 생성
            fig, ax = plt.subplots(figsize=(8, 5))
            bars = ax.bar(dimensions, scores, color=['#3b82f6', '#10b981', '#f59e0b'])
            
            # 값 표시
            for bar, score in zip(bars, scores):
                height = bar.get_height()
                ax.text(bar.get_x() + bar.get_width()/2., height,
                       f'{score:.1f}',
                       ha='center', va='bottom')
            
            ax.set_ylim(0, 7.5)
            ax.set_ylabel('점수', fontsize=12)
            ax.set_title('주요 리더십 차원 점수', fontsize=14)
            ax.grid(axis='y', alpha=0.3)
            
            # 저장
            chart_file = tempfile.NamedTemporaryFile(delete=False, suffix='.png')
            plt.savefig(chart_file.name, bbox_inches='tight', dpi=150)
            plt.close()
            
            return chart_file.name
            
        except Exception as e:
            logger.error(f"Bar chart creation error: {str(e)}")
            return None
    
    def _get_score_evaluation(self, score: float) -> str:
        """점수 평가"""
        if score >= 6.0:
            return "매우 우수"
        elif score >= 5.0:
            return "우수"
        elif score >= 4.0:
            return "양호"
        elif score >= 3.0:
            return "보통"
        else:
            return "개선 필요"